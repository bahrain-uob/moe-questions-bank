import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });
const modelId = `meta.llama3-8b-instruct-v1:0`;
const knowledgeID = "EU3Z7J6SG6";
const knowledgeType = "KNOWLEDGE_BASE";
const modelArn = `arn:aws:bedrock:us-east-1::foundation-model/${modelId}`;

const dbClient = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(dbClient);

export async function generate(event: APIGatewayProxyEvent) {
  const tableName = process.env.TABLE_NAME;

  //Handle empty body
  if (!event.body) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: true }),
    };
  }

  const data = JSON.parse(event.body);
  console.log(event.body);

  const exam = data.examContent;
  const examID = data.examID;
  const contributers = data.contributers;
  const discription = data.description;



  try {
    const prompt = `
      As a school exam generator, you will be given an exam that you will have to change based on the
      user's discription. Change only what the user asked for. Return only the newly modified exam.

      This is the user's discription and changes to do: ${discription}.

      This is the exam to modify: 
      ${exam}
    `;

      const command = new RetrieveAndGenerateCommand({
        input: {
          text: prompt,
        },
        retrieveAndGenerateConfiguration: {
          knowledgeBaseConfiguration: {
            generationConfiguration: {
              inferenceConfig: {
                textInferenceConfig: {
                  maxTokens: 3000,
                  stopSequences: [],
                  temperature: 0,
                  topP: 0.9,
                },
              },
              promptTemplate: {
                textPromptTemplate:
                  "Context:\nYou are a highly intelligent assistant specializing in generating exams for educational purposes. You create well-structured, balanced, and contextually relevant exams that align with grade-level requirements and assessment best practices.\n\nInstruction:\nUsing the following parameters, generate an exam:\n\nSubject: $subject$\nGrade Level: $class_level$\nQuestion Types: $question_types_str$\nInclude a variety of questions covering all specified types.\nDuration: The exam should not exceed $duration$ hour(s).\nTotal Marks: Distribute the total of $total_mark$ marks proportionally based on question types and their weightage.\nAdditional Context: Consider the following details while designing the exam: $search_results$.\nOutput Requirements:\n\nThe exam should include clear instructions for students.\nEach question must specify its marks.\nOrganize the exam into sections (if applicable) to ensure clarity.\nVerify that all question types are included and cover the essential topics for the grade level.\nExample Output Structure:\n\nExam Title\n\nSubject: [Subject Name]\nGrade Level: [Class Level]\nDuration: [Duration in Hours]\nTotal Marks: [Total Marks]\nInstructions for Students\n\n[Provide clear instructions for the exam, such as answer formatting or time management tips.]\nQuestions\n\nSection A: [Type of Questions, e.g., Multiple Choice]\nQuestion 1: ... [Marks]\nQuestion 2: ... [Marks]\nSection B: [Type of Questions, e.g., Short Answer]\nQuestion 3: ... [Marks]\nQuestion 4: ... [Marks]\nSection C: [Type of Questions, e.g., Essay/Problem Solving]\nQuestion 5: ... [Marks]\nEvaluation Criteria:\nEnsure the exam:\n\nTests a range of knowledge and skills.\nAligns with grade-level expectations.\nIs appropriately weighted across question types.\n",
              },
            },
            knowledgeBaseId: knowledgeID,
            modelArn:modelArn,
            orchestrationConfiguration: {
              inferenceConfig: {
                textInferenceConfig: {
                  maxTokens: 512,
                  stopSequences: [],
                  temperature: 0,
                  topP: 0.9,
                },
              },
            },
            retrievalConfiguration: {
              vectorSearchConfiguration: {
                numberOfResults: 5,
              },
            },
          },
          type: knowledgeType,
        },
      });


    const response = await client.send(command);

    // Extract and print the response text.
    const responseText = response.output.text;


    await dynamo.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          examID: examID, // Primary key to find the item
        },
        UpdateExpression: "SET examContent = :examContent, contributers = :contributers", // Update only examState
        ExpressionAttributeValues: {
          ":examContent": responseText,
          ":contributers": contributers,    // New value for examState
        },
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newExamContent: responseText,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true }),
    };
  }
}