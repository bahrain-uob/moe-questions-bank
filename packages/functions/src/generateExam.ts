import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });
const modelId = `anthropic.claude-3-5-sonnet-20240620-v1:0`;
const knowledgeID = "EU3Z7J6SG6";
const knowledgeType = "KNOWLEDGE_BASE";
const modelArn = `arn:aws:bedrock:us-east-1::foundation-model/${modelId}`;

export async function generate(event: APIGatewayProxyEvent) {
  let relevant_info = "";

  const prompt = "Generate an exam related to Eng102";

  //Handle empty body
  if (!event.body) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: true }),
    };
  }

  const data = JSON.parse(event.body);
  console.log(event.body);

  //Retrieve the data
  const class_level = data.class;
  const subject = data.subject;
  const question_types = data.question_types;
  const duration = data.duration;
  const total_mark = data.total_mark;

  //Format the question types list
  let question_types_str = "";
  if (question_types) {
    for (let i = 0; i < question_types.length; i++) {
      question_types_str += question_types[i];
      if (i !== question_types.length - 1) {
        question_types_str += ", ";
      }
    }
  }


  const request = {
    input: {
      text: prompt,
    },
    retrieveAndGenerateConfiguration: {
      knowledgeBaseConfiguration: {
        generationConfiguration: {
          inferenceConfig: {
            textInferenceConfig: {
              maxTokens: 1000,
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
  }
  
  console.log(request); 

  try {
    const command = new RetrieveAndGenerateCommand(request);
    console.log(RetrieveAndGenerateCommand)
    const response = await client.send(command);
    console.log({hi:"hi"});
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true }),
    };
  }
}