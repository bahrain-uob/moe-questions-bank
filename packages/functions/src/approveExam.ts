import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { OutputFormat, PollyClient, SynthesizeSpeechCommand, VoiceId } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const pollyClient = new PollyClient({});

const s3Client = new S3Client({});

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export async function approve(event: APIGatewayProxyEvent) {
  const examsTableName = process.env.TABLE_NAME;
  const datasetTableName = process.env.DATASET_TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);
  console.log("Dataset Table Name: " + datasetTableName);
  const bucketName = process.env.BUCKET_NAME;
  console.log("Bucket Name: " + process.env.BUCKET_NAME);
  const topicArn = process.env.TOPIC_ARN;
  console.log("topicArn: " + topicArn);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    //@ts-ignore
    let requestJSON = JSON.parse(event.body);
    let dynamoresponse = await dynamo.send(
      new GetCommand({
        TableName: examsTableName,
        Key: {
          examID: requestJSON.examID,
        },
      })
    );
    let listeningScript = "";
    const json = JSON.parse(dynamoresponse.Item?.examContent);
    for (const [sectionIndex, section] of json.sections.entries()) {
      if (section.title.toLowerCase().includes("listening")) {
        for (const [subIndex, subsection] of section.subsections.entries()) {
          const content = subsection.content;
          if (content?.passage || content?.dialogue) {
            const script = content.passage || content.dialogue;
            listeningScript += `Listening ${subIndex + 1}\n`;
            listeningScript += `${script}\n`;
            listeningScript += `Listening ${subIndex + 1} again\n`;
            listeningScript += `${script}\n`;
          }
        }
      }
    }
    console.log("listeningScript" + listeningScript)

    if(listeningScript != ""){
      listeningScript += "End of Listening"
    try{
    // Split the listeningScript into chunks of 3000 characters or less
    const textChunks = [];
    let currentChunk = "";

    for (const line of listeningScript.split("\n")) {
      if ((currentChunk + line).length > 3000) {
        textChunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += `${line}\n`;
    }
    if (currentChunk) {
      textChunks.push(currentChunk);
    }

    console.log(`Text split into ${textChunks.length} chunks.`);

    // Process each chunk
    const audioBuffers = [];

    for (const [index, chunk] of textChunks.entries()) {
      const pollyParams = {
        Text: chunk,
        OutputFormat: OutputFormat.MP3,
        VoiceId: VoiceId.Joanna,
      };

      console.log(`Processing chunk ${index + 1}/${textChunks.length}`);
      const synthesizeSpeechCommand = new SynthesizeSpeechCommand(pollyParams);
      const pollyResponse = await pollyClient.send(synthesizeSpeechCommand);

      if (!pollyResponse.AudioStream) {
        throw new Error(`Failed to generate audio for chunk ${index + 1}`);
      }

      const audioBuffer = await streamToBuffer(pollyResponse.AudioStream as Readable);
      audioBuffers.push(audioBuffer);
    }

    console.log("end audio")
    // Concatenate all audio buffers into a single file
    const concatenatedAudio = Buffer.concat(audioBuffers);
    console.log("uploading")
        // upload audio to S3
        const s3Key = `${requestJSON.examID}.mp3`;
        const s3Params = {
          Bucket: bucketName,
          Key: s3Key,
          Body: concatenatedAudio,
          ContentType: "audio/mpeg",
        };
        
        const putObjectCommand = new PutObjectCommand(s3Params);
        await s3Client.send(putObjectCommand);
        console.log(`Audio uploaded to S3 successfully at: ${s3Key}`);
      } catch (error) {
        console.error("Error during Polly or S3 operations:", error);
      }
    }
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: `The exam has been approved by the approver. Here is his comment: ${requestJSON.approverMsg}`,
        Subject: "Your Exam has been approved!",
        MessageAttributes: {
          email: {
            DataType: "String",
            StringValue: dynamoresponse?.Item?.createdBy,
          },
        },
      })
    );
    console.log("email send")


    await dynamo.send(
      new UpdateCommand({
        TableName: examsTableName,
        Key: {
          examID: requestJSON.examID, // Primary key to find the item
        },
        UpdateExpression:
          "SET examState = :examState, approverMsg = :approverMsg", // Update only examState
        ExpressionAttributeValues: {
          ":examState": "approved",
          ":approverMsg": requestJSON.approverMsg,
        },
      })
    );

    await dynamo.send(
      new PutCommand({
        TableName: datasetTableName,
        Item: {
          examID: randomUUID(),
          examContent: requestJSON.examContent,
          examState: "approved",
          approverMsg: requestJSON.approverMsg,
        },
      })
    )

    body = { exam_id: requestJSON.examID };
  } catch (error: any) {
    statusCode = 400;
    body = error.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
}

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
};
