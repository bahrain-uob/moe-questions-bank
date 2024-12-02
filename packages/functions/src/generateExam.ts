import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";

export async function generate(event: APIGatewayProxyEvent) {
  let data;

  //Handle empty body
  if (!event.body) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: true }),
    };
  }

  data = JSON.parse(event.body);
  console.log(event.body);

  //Retrieve the data
  const class_level = data.class;
  const subject = data.subject;
  const question_types = data.question_types;
  const duration = data.duration;
  const total_mark = data.total_mark;
  const like_previous_exams = data.like_previous_exams

  //Format the question types list
  // let question_types_str = "";
  // if (question_types) {
  //   for (let i = 0; i < question_types.length; i++) {
  //     question_types_str += question_types[i];
  //     if (i !== question_types.length - 1) {
  //       question_types_str += ", ";
  //     }
  //   }
  // }


  //relevant_info is to be retrieved from the analyzed data
  const relevant_info = "";
  let prompt = "";
  try {
    if(like_previous_exams){
      prompt = `
        Act as a school exam generator and create an exam for ENG102 students. The exam should have the following structure:

        Listening Section (Total: 10 marks)
          generate Listening script put it at appendix
          Question 1: A True or False question worth 5 marks.
          Question 2: A Match the Statements question worth 5 marks.

        Reading Section (Total: 20 marks)
          Part 1:
            provide an article.
            Include two sub-questions:
              a. Match the paragraphs with headings (5 marks).
              b. Short questions and answers (5 marks).
          Part 2:
            provide another article.
            Include two sub-questions:
              a. True or False (5 marks).
              b. Match words with their definitions (5 marks).

          Writing Section (Total: 20 marks)
            Question 1: A writing task worth 10 marks.
            Question 2: Another writing task worth 10 marks.

          The total duration of the exam should not exceed 2 hours.
          Take to consideration this relevant information: ${relevant_info}
      `;
    }
    else{
      prompt = `
        Act as a school exam generator and create an exam for grade ${class_level} ${subject} students. 
        The exam should have only the following :   
      `;
      // Dynamically build the prompt for each question type
      Object.entries(question_types).forEach(([type, count]) => {
        if (count > 0) {
          prompt += `include ${count} ${type} question${count > 1 ? "s" : ""}, `;
        }
      });
      prompt += `
        The total duration of the exam should not exceed ${duration} hours with total ${total_mark} marks.
        Take to consideration this relevant information: ${relevant_info}
      `;
    }
    

    const conversation = [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ];

    const command = new ConverseCommand({
      modelId,
      messages: conversation,
      inferenceConfig: { maxTokens: 1200, temperature: 0.5, topP: 0.9 },
    });

    const response = await client.send(command);

    


    // Extract and print the response text.
    const responseText = response.output.message.content[0].text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: responseText,
        built_prompt: prompt,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error generating question: " + error.message,
      }),
    };
  }
}
