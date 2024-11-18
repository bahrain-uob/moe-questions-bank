import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";


const sagemakerClient = new SageMakerRuntimeClient();

const ENDPOINT_NAME = "huggingface-pytorch-tgi-inference-2024-11-14-14-11-02-393"; // Replace with actual endpoint name

export async function handler(event: any) {
  //====> Code to copy to another function start here
  const class_level = event.body.class;
  const subject = event.body.subject;
  const question_types = event.body.question_types;
  const difficulty = event.body.difficulty;

  let question_types_str = "";
  if(question_types){
    for(let i=0; i < question_types.length; i++){
      question_types_str += question_types[i];
      if(i !== question_types.length-1){
        question_types_str += ", "
      }
    }
  }

  const relevant_info = ""

  try {

    //relevant_info is to be retrieved from the analyzed data from the s3 bucket

    const prompt = `
      Act as a school exam generator and create an ${subject} exam for grade ${class_level} students. 
      Make sure to include different types of questions. 

      These are the types of questions to include: ${question_types_str}. Include all of them.

      The exam should be ${difficulty}.

      Take to consideration this relevant information: ${relevant_info}
    `;

    //====> Code to copy to another function ends here

    // Generate question using SageMaker endpoint
    const response = await sagemakerClient.send(
      new InvokeEndpointCommand({
        EndpointName: ENDPOINT_NAME,
        ContentType: "application/json",
        Body: JSON.stringify({ inputs: prompt }),
      })
    );

    const result = JSON.parse(Buffer.from(response.Body).toString());
    const generatedQuestion = result[0].generated_text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: generatedQuestion, built_prompt:prompt }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error generating question: Faild" ,
      }),
    };
  }
};