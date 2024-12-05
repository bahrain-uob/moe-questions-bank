import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export async function handler(event: { body: string }) {
  const topicArn = process.env.TOPIC_ARN;
  const data = JSON.parse(event.body);

  try {
    const response = await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: data.message,
        Subject: "Problem with exam system!!",
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully!" }),
    };
  } catch (error) {
    console.error("SNS Publish Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send message!" }),
    };
  }
}
