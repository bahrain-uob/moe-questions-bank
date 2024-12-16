import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3Client = new S3Client({});

export async function handler(event: { body: string }) {
    const data = JSON.parse(event.body);
    const examID = data.examID;
    const bucketName = process.env.BUCKET_NAME;

    console.log("Bucket Name: " + bucketName);

    try {
        const s3Key = `${examID}.mp3`;

        const s3Params = {
            Bucket: bucketName,
            Key: s3Key,
        };

        const command = new GetObjectCommand(s3Params);
        const response = await s3Client.send(command);

        // Stream the response data
        const stream = response.Body as Readable;

        // Convert stream to a Base64 string
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString("base64");

        console.log(`Retrieved audio from S3 successfully: ${s3Key}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Audio retrieved successfully!",
                audioContent: audioBase64,
            }),
        };
    } catch (error: any) {
        console.error("Error retrieving audio from S3:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to get audio!" }),
        };
    }
}
