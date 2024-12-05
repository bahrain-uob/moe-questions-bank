import { APIGatewayProxyEvent } from "aws-lambda";
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getExamsCount(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  const params = {
    TableName: tableName, // Table name
    IndexName: "examStateIndex", // Specify the index name
    KeyConditionExpression: "examState = :state", // Query condition
    ExpressionAttributeValues: {
      ":state": "pending", // The value you want to match
    },
  };  

let result;
  try {
    // Query the DynamoDB table and get the count
     result = await dynamodb.query(params).promise();

    console.log("Count of exams:", result);

  } catch (error) {
    console.error("Error querying exams:", error);
    statusCode = 400;
    body = JSON.stringify({ error: "Unable to count exams" });
  } finally {
      // Return the count as the response body
      body = JSON.stringify({ count: result.Count });
}

  // Return response
  return {
    statusCode,
    body,
    headers,
  };
}
