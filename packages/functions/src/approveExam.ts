import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { OutputFormat, PollyClient, SynthesizeSpeechCommand, VoiceId } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Readable } from "stream";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

const pollyClient = new PollyClient({});
const s3Client = new S3Client({});

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export async function approve(event: APIGatewayProxyEvent) {
  const examsTableName = process.env.EXAMS_TABLE_NAME;
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
    //@ts-ignore
    const prompt = "Extract only the listening script if there is No script rturn No script only frome this " + dynamoresponse.Item.examContent +"only return the script or just No script";
    const conversation = [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ];
    

    const command = new ConverseCommand({
      modelId,
      //@ts-ignore
      messages: conversation,
      inferenceConfig: { maxTokens: 1200, temperature: 0.5, topP: 0.9 },
    });

    console.log("Prompt built");
    const bedrockresponse = await bedrockClient.send(command);
    
    // Extract and print the response text.
    const listeningScript = bedrockresponse?.output?.message?.content?.[0]?.text;
    console.log("Model done "+listeningScript);

    if(listeningScript && listeningScript != "No script"){
      const pollyParams = {
        Text: listeningScript,
        OutputFormat: OutputFormat.MP3,
        VoiceId: VoiceId.Joanna,
      };
      
      console.log(`pollyParams: ${pollyParams}`);
      const synthesizeSpeechCommand = new SynthesizeSpeechCommand(pollyParams);
      const pollyResponse = await pollyClient.send(synthesizeSpeechCommand);
  
      if (!pollyResponse.AudioStream) {
        throw new Error("Failed to generate audio from Polly");
      }
  
      // Convert the AudioStream to a buffer
      const audioBuffer = await streamToBuffer(pollyResponse.AudioStream as Readable);

      // Save audio to S3
      const s3Key = `${requestJSON.examID}.mp3`;
      const s3Params = {
        Bucket: bucketName,
        Key: s3Key,
        Body: audioBuffer,
        ContentType: "audio/mpeg",
      };

      const putObjectCommand = new PutObjectCommand(s3Params);
      await s3Client.send(putObjectCommand);

      console.log(`Audio uploaded to S3 at: ${s3Key}`);
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
