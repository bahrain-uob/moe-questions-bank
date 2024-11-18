import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

// Initialize the DynamoDB DocumentClient
const dynamoDb = new DynamoDB.DocumentClient();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Log the event for debugging
    console.log("Received event for fetching exam history:", JSON.stringify(event));

    // Fetch filters from query parameters (optional)
    const { grade, subject } = event.queryStringParameters || {};

    // Define the parameters for the DynamoDB query
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.EXAM_HISTORY_TABLE!, // Use the environment variable for table name
      FilterExpression: "", // Initialize as empty string
      ExpressionAttributeValues: {}, // Initialize as an empty object
    };

    // Optional: Apply filters if grade and/or subject are provided
    const filterConditions = []; // Array to store filter conditions
    if (grade) {
      filterConditions.push("grade = :grade");
      params.ExpressionAttributeValues![":grade"] = grade;
    }

    if (subject) {
      filterConditions.push("subject = :subject");
      params.ExpressionAttributeValues![":subject"] = subject;
    }

    // Join multiple filter conditions with "AND" if any exist
    if (filterConditions.length > 0) {
      params.FilterExpression = filterConditions.join(" AND ");
    } else {
      delete params.FilterExpression; // Remove FilterExpression if no filters are provided
      delete params.ExpressionAttributeValues; // Remove ExpressionAttributeValues if empty
    }

    // Scan the DynamoDB table
    const result = await dynamoDb.scan(params).promise();

    // Return the exam history as a response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Exam history retrieved successfully.",
        data: result.Items,
      }),
    };
  } catch (error) {
    // Log the error
    console.error("Error fetching exam history:", error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch exam history.",
      }),
    };
  }
};
