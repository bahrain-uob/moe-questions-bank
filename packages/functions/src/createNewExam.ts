import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockAgentRuntimeClient,
  RetrieveCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { ENG102PROMPT } from "./prompts/Eng102";

const client = new DynamoDBClient({
  region: "us-east-1",
  maxAttempts: 5,
});

const dynamo = DynamoDBDocumentClient.from(client);

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

export async function createExam(event) {
  if (!client || !dynamo) { 
    console.log("Error with DynamoDB client");
  }
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name:", process.env.TABLE_NAME);

  // Handle empty body
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is missing" }),
    };
  }

  let data = JSON.parse(event.body);
  console.log(data)

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  let prompt = "";

  // Handle regeneration or creation
  if (data.examID) {
    // Regenerate an existing exam with specific updates
    try {
      const result = await dynamo.send(
        new GetCommand({
          TableName: tableName,
          Key: { examID: data.examID },
        })
      );

      if (!result.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "Exam not found" }),
        };
      }

      const existingExam = JSON.parse(result.Item.examContent);

       // Build prompt to update exam content
      if (data.feedback) {
        prompt = `
        Update the following exam based on the feedback provided.
        Ensure that all related information is recalculated to maintain consistency.
        Feedback: ${JSON.stringify(data.feedback, null, 2)}

        Current Exam Content:
        ${JSON.stringify(existingExam, null, 2)}

        The type of your response must be a JSON object containing the updated exam only. Ensure all changes are reflected accurately
        `;
      } else {
        //for normal regenerating without feedback
        prompt = `
        Regenerate the following exam to improve its structure, variety, and balance. 
        Maintain the original structure and question count unless specified otherwise.

        Current Exam Content:
        ${JSON.stringify(existingExam, null, 2)}

        The type of your response must be a JSON object containing the updated exam only.
        `;
      }

      console.log("Prompt for Regeneration:", prompt);

      const conversation = [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ];

      const command = new ConverseCommand({
        modelId,
        //@ts-ignore
        messages: conversation,
        inferenceConfig: { maxTokens: 4096, temperature: 0.5, topP: 0.9 },
      });

      const response = await bedrockClient.send(command);

      //@ts-ignore
      const responseText = response.output.message.content[0].text;
      console.log("Updated Exam Content:", responseText);

      await dynamo.send(
        new UpdateCommand({
          TableName: tableName,
          Key: { examID: data.examID },
          UpdateExpression: "SET examContent = :examContent, numOfRegenerations = numOfRegenerations + :incr, contributors = :contributors",
          ExpressionAttributeValues: {
            ":examContent": responseText,
            ":incr": 1,
            ":contributors": data.contributors
          },
        })
      );
    console.log("Prompt built");

    //const response = await bedrockClient.send(command);

      body = { message: "Exam successfully regenerated", updatedExamContent: responseText };
    } catch (error) {
      console.error("Error regenerating exam:", error);
      statusCode = 500;
      body = { error: "Failed to regenerate exam", details: error.message };
    }
  } else {
    // Create a new exam
    try {
      const bedrockAgentClient = new BedrockAgentRuntimeClient({ region: "us-east-1" });
      let retrieveCommand = new RetrieveCommand({
        knowledgeBaseId: "EU3Z7J6SG6",
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 10,
          },
        },
        retrievalQuery: {
          text: `${data.class} ${data.subject} questions`,
        },
      });

      if (!data.customize) {
        const relevant_info = (await bedrockAgentClient.send(retrieveCommand)).retrievalResults?.map(e => e.content?.text).join("\n").toString();
        prompt = ENG102PROMPT + ' Refer to the following relevant information from past exams:' + relevant_info;
      } else {
        prompt = `
        Create an exam for grade ${data.class} ${data.subject} students. 
        Include ${data.duration} hours, total ${data.total_mark} marks, and the following question types:
        ${Object.entries(data.question_types).map(([type, count]) => `${count} ${type} question(s)`).join(", ")}.
    

        Use the following relevant past exam data:
        ${JSON.stringify(retrieveCommand.input.retrievalQuery, null, 2)}

        Your response must be a JSON object containing the new exam.
        `;
      }

      console.log("Prompt for Creation:", prompt);

      const conversation = [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ];

      const command = new ConverseCommand({
        modelId,
        //@ts-ignore
        messages: conversation,
        inferenceConfig: { maxTokens: 4096, temperature: 0.5, topP: 0.9 },
      });

    console.log("Prompt built");

    const response = await bedrockClient.send(command);

    // Extract and print the response text.
    //@ts-ignore
    const responseText = response.output.message.content[0].text;

    console.log(responseText)

    console.log("Model done");
    //@ts-ignore
      console.log("ResponseText size:", Buffer.byteLength(responseText, "utf-8"));
      
      console.log(data)

      const uuid = uuidv4();
      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            examID: uuid,
            examState: "building",
            examClass: data.class,
            examSubject: data.subject,
            examSemester: data.semester,
            examDuration: data.duration,
            examMark: data.total_mark,
            examContent: responseText,
            createdBy: data.created_by,
            creationDate: data.creation_date,
            contributors: data.contributors,
            numOfRegenerations: 0,
          },
        })
      );

      body = {examID: uuid, message: "Exam successfully created"}
    } catch (error) {
      console.error("Error creating exam:", error);
      statusCode = 500;
      body = { error: "Failed to create exam", details: error.message };
    }
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
}
