import { defaultProvider } from '@aws-sdk/credential-provider-node'; // V3 SDK.
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';



const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT!;
const name = 'embeddings'; // The name of the vector index

// https://opensearch.org/docs/latest/clients/javascript/index/#authenticating-from-within-an-aws-lambda-function
//https://stackoverflow.com/questions/50095766/aws-version-4-signature-snippet-code-with-example-in-javascript
const signer = AwsSigv4Signer({
  region:'us-east-1',
  service: 'aoss',
  getCredentials: () => {
    const credentialsProvider = defaultProvider();
    console.log('credentialsProvider:', credentialsProvider().then((data: any) => console.log(data)));
    console.log(OPENSEARCH_ENDPOINT);
    return credentialsProvider();
  }
});

const ACCESS_KEY_ID = ""; // Replace with your access key ID
const SECRET_ACCESS_KEY = ""; // Replace with your secret access key
const client = new Client({
  ...signer,
  node: OPENSEARCH_ENDPOINT,
  //AwsSigv4Auth 
  auth:  {
    credentials : {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      sessionToken: ""
    },
    region: "us-east-1",
    service: "aoss"
  }
});


async function createIndex(name: string) {
  var index_name = name;

 // Define the request body for creating the vector index
const indexBody = {
  settings: {
    index: {
      knn: true,
      "knn.algo_param.ef_search": 512,
    },
  },
  mappings: {
    properties: {
      vectorField: {
        type: "knn_vector",  // Matches "vectorField"
        dimension: 1536,      // Change this to match the dimension of your vectors
        method: {
          name: "hnsw",
          engine: "faiss",
          parameters: {},
          space_type: "l2",  // Using L2 (Euclidean distance)
        },
      },
      textField: {
        type: "text",        // Matches "textField"
        index: true,         // Enables indexing for full-text search
      },
      metadataField: {
        type: "text",      // Matches "metadataField"
        index: false,       // Ensures the metadata is queryable
      },
    },
  },
};


  var response = await client.indices.create({
    index: index_name,
    body: indexBody,
  });

  console.log('Index created:', response);
  return response;
}

// Lambda handler function to create the index
export const handler = async (event: any): Promise<any> => {
  try {
    const response = await createIndex(name);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Index created successfully',
        data: response,
      }),
    };
  } catch (error: any) {
    console.error('Error creating index:', error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error creating index',
        error: error.response?.data || error.message,
      }),
    };
  }
};