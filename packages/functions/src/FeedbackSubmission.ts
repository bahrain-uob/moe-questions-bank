// Import AWS SDK clients for DynamoDB and SNS
import { DynamoDB } from "aws-sdk"; // For interacting with DynamoDB
import { SNS } from "aws-sdk"; // For sending email notifications using SNS

// Initialize DynamoDB client
const dynamoDb = new DynamoDB.DocumentClient();

// Initialize SNS client
const sns = new SNS();

export async function handler(event: any) {
  // Log the incoming event (for debugging purposes)
  console.log("Received event:", JSON.stringify(event));

  // Extract feedback data from the event (this comes from the frontend)
  const { feedbackType, message } = JSON.parse(event.body);

  // Validate that feedback data exists
  if (!feedbackType || !message) {
    return {
      statusCode: 400, // HTTP 400 Bad Request
      body: JSON.stringify({ error: "Feedback type and message are required." }),
    };
  }

  // Generate a unique ID for the feedback
  const feedbackId = `feedback-${Date.now()}`;

  // Create a timestamp for when the feedback is submitted
  const timestamp = new Date().toISOString();

  // Define the item to store in DynamoDB
  const feedbackItem = {
    feedbackId, // Unique feedback ID
    feedbackType, // Type of feedback (e.g., "normal" or "problem")
    message, // User's feedback message
    timestamp, // When the feedback was submitted
  };

  // Save the feedback item to DynamoDB
  try {
    await dynamoDb
      .put({
        TableName: process.env.FEEDBACK_TABLE!, // DynamoDB table name from environment variables
        Item: feedbackItem, // The feedback data to save
      })
      .promise(); // Execute the save operation

    console.log("Feedback saved to DynamoDB:", feedbackItem);
  } catch (error) {
    console.error("Error saving feedback to DynamoDB:", error);
    return {
      statusCode: 500, // HTTP 500 Internal Server Error
      body: JSON.stringify({ error: "Failed to save feedback." }),
    };
  }

  // If the feedback type is "problem," send an alert via SNS
  if (feedbackType === "problem") {
    // Define the email notification message
    const alertMessage = `
      New Problem Reported:
      - Feedback ID: ${feedbackId}
      - Message: ${message}
      - Timestamp: ${timestamp}
    `;

    try {
      // Publish the message to the SNS topic
      await sns
        .publish({
          TopicArn: process.env.SNS_TOPIC_ARN, // SNS topic ARN from environment variables
          Subject: "New Problem Reported", // Email subject
          Message: alertMessage, // Email body
        })
        .promise(); // Execute the publish operation

      console.log("Alert sent via SNS:", alertMessage);
    } catch (error) {
      console.error("Error sending SNS alert:", error);
      return {
        statusCode: 500, // HTTP 500 Internal Server Error
        body: JSON.stringify({ error: "Failed to send alert email." }),
      };
    }
  }

  // Return a success response
  return {
    statusCode: 200, // HTTP 200 OK
    body: JSON.stringify({ message: "Feedback submitted successfully." }),
  };
}
