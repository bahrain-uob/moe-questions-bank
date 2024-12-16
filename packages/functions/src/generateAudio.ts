
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { APIGatewayProxyEvent } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';

// Initialize AWS Clients
const client = new DynamoDBClient({ region: "us-east-1", maxAttempts: 5 });
const dynamo = DynamoDBDocumentClient.from(client);
const pollyClient = new PollyClient({ region: "us-east-1" });
const s3Client = new S3Client({ region: "us-east-1" });

const tableName = process.env.TABLE_NAME;
const bucketName ="qbtesttest"// process.env.AUDIO_BUCKET_NAME;  

// Convert Polly AudioStream (SdkStreamMixin) to Node.js Buffer
const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', reject);
  });
};
export async function generateAudio(event: APIGatewayProxyEvent) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is missing" }),
    };
  }

  let data = JSON.parse(event.body);
  console.log("Exam data:", data);

  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  if (!data.examID || !data.bucketName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Exam ID and Bucket Name are required" }),
    };
  }

  try {
    // Get exam content from DynamoDB
    const result = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: { examID: data.examID },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Exam not found" }),
      };
    }

    const examContent = JSON.parse(result.Item.examContent);

    // Prepare audio generation for both passage and dialogue
    const audioKeys = [];
    const audioUrls = [];

    // Helper function to generate audio and upload to S3
    const generateAndUploadAudio = async (text: string, suffix: string) => {
      const audioCommand = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: "mp3",
        VoiceId: "Joanna",
      });

      const audioResponse = await pollyClient.send(audioCommand);
      const audioBuffer = await streamToBuffer(audioResponse.AudioStream as Readable);

      const audioKey = `audio/${data.examID}-${suffix}.mp3`;
      const audioUrl = `https://${bucketName}.s3.amazonaws.com/${audioKey}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: audioKey,
          Body: audioBuffer,
          ContentType: "audio/mpeg",
        })
      );

      return { audioKey, audioUrl };
    };

    // Generate audio for passage
    if (examContent.sections[0]?.subsections[0]?.content?.passage) {
      const passageAudio = await generateAndUploadAudio(
        examContent.sections[0].subsections[0].content.passage,
        "passage"
      );
      audioKeys.push(passageAudio.audioKey);
      audioUrls.push(passageAudio.audioUrl);
    }

    // Generate audio for dialogue
    if (examContent.sections[0]?.subsections[1]?.content?.dialogue) {
      const dialogueAudio = await generateAndUploadAudio(
        examContent.sections[0].subsections[1].content.dialogue,
        "dialogue"
      );
      audioKeys.push(dialogueAudio.audioKey);
      audioUrls.push(dialogueAudio.audioUrl);
    }

    // Update exam content with audio URLs
    await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { examID: data.examID },
        UpdateExpression: "SET audioUrls = :audioUrls",
        ExpressionAttributeValues: {
          ":audioUrls": audioUrls,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Audio generated successfully",
        audioUrls,
      }),
      headers,
     
    };
  } catch (error) {
    console.error("Error generating audio:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate audio", details: error.message }),
      headers,
    };
  }
}
