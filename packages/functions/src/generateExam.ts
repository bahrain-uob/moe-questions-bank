import { APIGatewayProxyHandler } from "aws-lambda";

// Main handler function for the "generate exam" Lambda
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Log the received event (debugging purposes)
    console.log("Generate Exam event received:", JSON.stringify(event));

    // Parse the incoming request body
    const requestBody = JSON.parse(event.body || "{}");
    const { class: selectedClass, subject, questionTypes, difficulty } = requestBody;

    // Validate required fields
    if (!selectedClass || !subject || !questionTypes || !difficulty) {
      return {
        statusCode: 400, // HTTP 400 Bad Request
        body: JSON.stringify({ error: "Missing required fields in the request body." }),
      };
    }

    // Simulate generating exam questions (replace this with actual logic later)
    const generatedExam = {
      class: selectedClass,
      subject,
      questionTypes,
      difficulty,
      questions: [
        {
          question: "What is 2 + 2?",
          type: "multiple_choice",
          options: ["2", "3", "4", "5"],
          correctAnswer: "4",
        },
        {
          question: "What is the capital of France?",
          type: "essay",
        },
      ],
    };

    // Log the generated exam (debugging purposes)
    console.log("Generated Exam:", JSON.stringify(generatedExam));

    // Return the generated exam in the response
    return {
      statusCode: 200, // HTTP 200 OK
      body: JSON.stringify({
        message: "Exam generated successfully.",
        exam: generatedExam,
      }),
    };
  } catch (error) {
    // Log the error
    console.error("Error in generateExam handler:", error);

    // Return an error response
    return {
      statusCode: 500, // HTTP 500 Internal Server Error
      body: JSON.stringify({
        error: "Failed to generate exam. Please try again later.",
      }),
    };
  }
};
