import { BedrockAgentClient, StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";

 
export async function handler(event: any) {
 
  const knowledgeBaseId = process.env.KNOWLEDGE_BASE_ID;
  const dataSourceId = process.env.DATA_SOURCE_ID;
 
  // Create a client for Bedrock Agent
  const client = new BedrockAgentClient({ region: "us-east-1" });
 
  // Generate a unique client token with at least 33 characters
  const clientToken = `kb-sync-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
 
  // Define the input for the StartIngestionJobCommand
  const input = {
    knowledgeBaseId: knowledgeBaseId, // Knowledge Base ID
    dataSourceId: dataSourceId, // Data Source ID
    clientToken: clientToken, // Unique client token
    description: "Syncing knowledge base data from S3", // Description of the ingestion job
  };
 
  try {
    // Start the ingestion job
    const command = new StartIngestionJobCommand(input);
    const response = await client.send(command);
 
    // Check if ingestionJob is defined in the response
    if (!response.ingestionJob) {
      throw new Error("Ingestion job not returned in response");
    }
 
    // Log the response for debugging purposes
    console.log("Ingestion job started successfully:", response.ingestionJob);
 
    // Return the status of the ingestion job
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ingestion job started successfully",
        ingestionJobId: response.ingestionJob.ingestionJobId,
        status: response.ingestionJob.status,
      }),
    };
  } catch (error) {
    console.error("Error starting ingestion job:", error);
 
    // Return an error message if the ingestion job fails
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error starting ingestion job",
        error: "error",
      }),
    };
  }
}