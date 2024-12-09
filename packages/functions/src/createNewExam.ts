import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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

const client = new DynamoDBClient({
  region: "us-east-1",
  maxAttempts: 5,
});

const dynamo = DynamoDBDocumentClient.from(client);
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
const bedrockAgentClient = new BedrockAgentRuntimeClient({ region: "us-east-1"  });

enum Language {
  en = "en",
  ar = "ar",
}

interface PromptPreset {
  expressPrompt: string;
  retrievalQuery: string | undefined;
  modelId: string;
  knowledgeBaseId: string;
  language: Language;
}

// dictionary or interface mapping the subject to the model id, knowledgeBaseId, prompt, etc.
// so that we can dynamically select the model id, knowledgeBaseId, prompt, etc. based on the subject
const subjectToPromptPreset: Record<string, PromptPreset> = {
  "ENG102": {
    modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    knowledgeBaseId: "EU3Z7J6SG6",
    retrievalQuery: "ENG102 questions",
    language: Language.en,
    expressPrompt:  `
    Act as a school exam generator and create an exam for ENG102 students. The total duration of the exam should not exceed 2 hours.
    Make sure the exam examines the students in different aspects sufficiently.
    
    For the reading part generate a short 100 words article and create questions on it.

    For the listening part create a short listening script and keep it in the appendix of the exam and make the questions on it.

    The exam should be structured approriately.

    This is the exam structure to follow:
  Listening Section (Total: 10 marks)
    Question 1: Create true/false questions on the listening script worth 5 marks.
    Question 2: Create a match the Statements question on the listening script worth 5 marks.

  Reading Section (Total: 20 marks)
    Part 1 (Reasoning):
      Include two sub-questions:
        a. Match the paragraphs with headings (5 marks).
        b. Short questions and answers (5 marks).
    Part 2 (Vocabulary):
      Generate another article (50 Word).
      Include two sub-questions:
        a. True or False (5 marks) on the article.
        b. Match words from the article with their definitions (5 marks).

    Writing Section (Total: 20 marks)
      Question 1: A writing task worth 10 marks.
      Question 2: Another writing task worth 10 marks.


      Make sure that all the questions has their marks assigned to them.
    
    Take to consideration this relevant information from past exams: $relevant_info$
    
    Return only the exam and nothing else.`,
  },
  "ARAB101": {
    modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0", // TODO: change this to the correct model id
    knowledgeBaseId: "EU3Z7J6SG6", // TODO: change this to the correct knowledgeBaseId
    retrievalQuery: "ARAB101 questions",
    language: Language.ar,
    expressPrompt: ``,
  },
};

export async function createExam(event: APIGatewayProxyEvent) {
  if (!client || !dynamo) { 
    console.log("Error with dynamo")
  }
  const tableName = process.env.TABLE_NAME;
  console.log("Table Name: " + process.env.TABLE_NAME);

  //Handle empty body
  if (!event.body) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: true }),
    };
  }

  let data = JSON.parse(event.body);

  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  let prompt = "";

  // get the subject preset based on the subject
  const promptPreset = subjectToPromptPreset[data.subject];
  if (!promptPreset) {
    throw new Error(`Subject ${data.subject} not found in the subjectToModelIdMap`);
  }
  
  let retrieveCommand = new RetrieveCommand({
    knowledgeBaseId: promptPreset.knowledgeBaseId,
    retrievalConfiguration: {
      vectorSearchConfiguration: {
        numberOfResults: 10,
      },
    },
    retrievalQuery: {
      text: promptPreset.retrievalQuery,
    },
  });

  if (!data.customize) {
    const relevant_info = (await bedrockAgentClient.send(retrieveCommand)).retrievalResults?.map(e => e.content?.text).join("\n").toString();
    prompt = subjectToPromptPreset[data.subject].expressPrompt.replace('$relevant_info$', relevant_info? relevant_info : "");
  } else {
    prompt = `
        Act as a school exam generator and create an exam for grade ${data.class} ${data.subject} students.
        The exam should have only the following :
      `;
    // Dynamically build the prompt for each question type
    Object.entries(data.question_types).forEach(([type, count]) => {
      //@ts-ignore
      if (count > 0) {
        //@ts-ignore
        prompt += `include ${count} ${type} question${count > 1 ? "s" : ""}, `;
      }
    });
    retrieveCommand.input.retrievalQuery = {
      text: `grade ${data.class} ${data.subject} questions ${Object.entries(data.question_types).map(([type, count]) => `${count} ${type}`).join(", ")}`,
    };
    // console.log(retrieveCommand);
    const relevant_info = (await bedrockAgentClient.send(retrieveCommand)).retrievalResults?.map(e => e.content?.text).join("\n").toString();
    prompt += `
        The total duration of the exam should not exceed ${data.duration} hours with total ${data.total_mark} marks.
        Take to consideration this relevant information from past exams: ${relevant_info}
      `;
  }

  try {
    const conversation = [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ];

    const command = new ConverseCommand({
      modelId: promptPreset.modelId,
      //@ts-ignore
      messages: conversation,
      inferenceConfig: { maxTokens: 1200, temperature: 0.5, topP: 0.9 },
    });

    console.log("Prompt built");

    const response = await bedrockClient.send(command);

    // Extract and print the response text.
    //@ts-ignore
    const responseText = response.output.message.content[0].text;

    console.log("Model done");
    //@ts-ignore
    console.log("ResponseText size:", Buffer.byteLength(responseText, "utf-8"));

    const uuid = uuidv4();
    if (responseText) {
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
            contributers: data.contributers,
            numOfRegenerations: 0,
          },
        })
      );
    }

    console.log("Put done")

    body = { exam_id: uuid };
  } catch (error: any) {
    statusCode = 400;
    body = error.message;
    console.log(error.message)
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
}
