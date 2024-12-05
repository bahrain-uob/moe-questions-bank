import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

export async function getExamData(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    body = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          //@ts-ignore
          examID: event.pathParameters.id,
        },
      })
    );
    body = body.Item;
  } catch (err) {
    statusCode = 400;
    //@ts-ignore
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
}
