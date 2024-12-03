import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });
const modelId = "meta.llama3-8b-instruct-v1:0";
const knowledgeID = "EU3Z7J6SG6";
const knowledgeType = "KNOWLEDGE_BASE";
const modelArn =
  "arn:aws:bedrock:us-east-1::foundation-model/meta.llama3-8b-instruct-v1:0";

export async function generate(event: APIGatewayProxyEvent) {
  let relevant_info = "";

  const prompt = `
Act as a school exam generator and create an exam for ENG102 students. The exam should have the following structure:

Listening Section (Total: 10 marks)
  generate Listening script
  Question 1: A True or False question worth 5 marks.
  Question 2: A Match the Statements question worth 5 marks.

Reading Section (Total: 20 marks)
  Part 1:
    provide an article 
    Include two sub-questions:
      a. Match the paragraphs with headings (5 marks).
      b. Short questions and answers (5 marks).
  Part 2:
    provide another article 
    Include two sub-questions:
      a. True or False (5 marks).
      b. Match words with their definitions (5 marks).

  Writing Section (Total: 20 marks)
    Question 1: A writing task worth 10 marks.
    Question 2: Another writing task worth 10 marks.

  The total duration of the exam should not exceed 2 hours.
  Take to consideration this relevant information: ${relevant_info}
`;

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

  try {
    console.log(prompt); 
    const command = new RetrieveAndGenerateCommand({
      input: {
        text: "Create an English exam. The exam should include the following question types: multiple choice, short answer, and essay writing. The exam duration should not exceed 1 hour, and the total marks should be 50, distributed proportionally based on question types."
      },
      retrieveAndGenerateConfiguration: {
        knowledgeBaseConfiguration: {
          generationConfiguration: {
            inferenceConfig: {
              textInferenceConfig: {
                maxTokens: 512,
                stopSequences: [],
                temperature: 0,
                topP: 0.9
              }
            },
            promptTemplate: {
              textPromptTemplate: "Context:\nYou are a highly intelligent assistant specializing in generating exams for educational purposes. You create well-structured, balanced, and contextually relevant exams that align with grade-level requirements and assessment best practices.\n\nInstruction:\nUsing the following parameters, generate an exam:\n\nSubject: $subject$\nGrade Level: $class_level$\nQuestion Types: $question_types_str$\nInclude a variety of questions covering all specified types.\nDuration: The exam should not exceed $duration$ hour(s).\nTotal Marks: Distribute the total of $total_mark$ marks proportionally based on question types and their weightage.\nAdditional Context: Consider the following details while designing the exam: $search_results$.\nOutput Requirements:\n\nThe exam should include clear instructions for students.\nEach question must specify its marks.\nOrganize the exam into sections (if applicable) to ensure clarity.\nVerify that all question types are included and cover the essential topics for the grade level.\nExample Output Structure:\n\nExam Title\n\nSubject: [Subject Name]\nGrade Level: [Class Level]\nDuration: [Duration in Hours]\nTotal Marks: [Total Marks]\nInstructions for Students\n\n[Provide clear instructions for the exam, such as answer formatting or time management tips.]\nQuestions\n\nSection A: [Type of Questions, e.g., Multiple Choice]\nQuestion 1: ... [Marks]\nQuestion 2: ... [Marks]\nSection B: [Type of Questions, e.g., Short Answer]\nQuestion 3: ... [Marks]\nQuestion 4: ... [Marks]\nSection C: [Type of Questions, e.g., Essay/Problem Solving]\nQuestion 5: ... [Marks]\nEvaluation Criteria:\nEnsure the exam:\n\nTests a range of knowledge and skills.\nAligns with grade-level expectations.\nIs appropriately weighted across question types.\n"
            }
          },
          knowledgeBaseId: "EU3Z7J6SG6",
          modelArn: "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-text-premier-v1:0",
          orchestrationConfiguration: {
            inferenceConfig: {
              textInferenceConfig: {
                maxTokens: 512,
                stopSequences: [],
                temperature: 0,
                topP: 0.9
              }
            }
          },
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5
            }
          }
        },
        type: "KNOWLEDGE_BASE"
      }
    }
    );
    console.log(command);
    const response = await client.send(command);
    console.log(response);
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true }),
    };
  }
}