import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

export async function disapprove(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    let requestJSON = JSON.parse(event.body);

    await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          examID: requestJSON.examID, // Primary key to find the item
        },
        UpdateExpression:
          "SET examState = :examState, approverMsg = :approverMsg", // Update only examState
        ExpressionAttributeValues: {
          ":examState": "disapproved",
          ":approverMsg": requestJSON.approverMsg,
        },
      })
    );

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
