import { APIGatewayProxyEvent } from "aws-lambda";
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");

const dynamodb = DynamoDBDocument.from(new DynamoDB());

export async function getExamsCount(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const states = ["approved", "disapproved", "building", "pending"];
    const counts: { [key: string]: number } = {};

    for (const state of states) {
      const params = {
        TableName: tableName, 
        IndexName: "examStateIndex",
        KeyConditionExpression: "examState = :state", 
        ExpressionAttributeValues: {
          ":state": state, 
        },
      };

      const result = await dynamodb.query(params);
      counts[state] = result.Count || 0; // Use 0 if result.Count is undefined
    }

    body = JSON.stringify(counts);
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

