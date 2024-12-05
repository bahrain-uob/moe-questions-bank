import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

export async function handler(event: APIGatewayProxyEvent) {
    const tableName = process.env.TABLE_NAME;
    console.log("Table Name: " + process.env.TABLE_NAME);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    let requestJSON = JSON.parse(event.body);

    console.log("the passed email is: " + requestJSON.email);
    body = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          email: requestJSON.email,
        },
      })
    );

    // body = await dynamo.send(new ScanCommand({ TableName: tableName }));

    body = body.Item;

    console.log(body);

    if (!body) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found." }),
      };
    }
  } catch (err) {
    statusCode = 400;
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
