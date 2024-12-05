import { APIGatewayProxyEvent } from "aws-lambda";
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getExams(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    console.log(event.queryStringParameters);
    const queryParams = event.queryStringParameters || {};
    const examState = queryParams.state;
    console.log("Exam State:", examState);

    // Define DynamoDB query parameters
    const params = {
      TableName: tableName,
      IndexName: "examStateIndex", 
      Select: "COUNT", // Return only the count of matching items
    };

    // Query the DynamoDB table and get the count
    const result = await dynamodb.query(params).promise();

    console.log("Count of exams:", result.Count);

    // Return the count as the response body
    body = JSON.stringify({ count: result.Count });

  } catch (error) {
    console.error("Error querying exams:", error);
    statusCode = 400;
    body = JSON.stringify({ error: "Unable to count exams" });
  }

  // Return response
  return {
    statusCode,
    body,
    headers,
  };
}
