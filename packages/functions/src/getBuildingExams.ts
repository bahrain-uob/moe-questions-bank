import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
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

    const params = {
      TableName: tableName, // Table name
      IndexName: "examStateIndex", // Specify the index name
      KeyConditionExpression: "examState = :state", // Query condition
      ExpressionAttributeValues: {
        ":state": "building", // The value you want to match
      },
    };

  try {
    body = await dynamodb.query(params).promise();
  } catch (error) {
    console.error("Error querying exams:", error);
    statusCode = 400;
  } finally {
    body = JSON.stringify(body.Items);
  }

  return {
    statusCode,
    body,
    headers,
  };
}
