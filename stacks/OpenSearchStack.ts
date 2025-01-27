import { StackContext, Function } from "sst/constructs"; // Import necessary constructs from SST
import { CfnAccessPolicy, CfnCollection, CfnSecurityPolicy } from "aws-cdk-lib/aws-opensearchserverless";
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Aws } from "aws-cdk-lib"; // Import AWS class to access account and region info
import { Construct } from "constructs"; // Import Construct to define resources
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "aws-cdk-lib/custom-resources";

function getResourceName(name: string, stage: string) {
  return `${name}-${stage}`;
}

const BASE_COLLECTION_NAME = "collection";
function getCollectionName(stage: string) {
  return getResourceName(BASE_COLLECTION_NAME, stage);
}

// OpenSearch Construct for creating a collection and necessary policies
export function OpenSearchConstruct(scope: Construct, executorRole: Role, stage: string): {collectionEndpoint: string, collectionArn: string} {
  const accountId = Aws.ACCOUNT_ID; // Dynamically retrieve AWS account ID

  const collectionName = getCollectionName(stage);
  
  const securityPolicyName = getResourceName("my-collection-policy", stage);
  const networkPolicyName = getResourceName("my-network-policy", stage);
  const dataAccessPolicyName = getResourceName("my-data-access-policy", stage);
  const collectionResourceName = `collection/${collectionName}`;
  const indexResourceName = `index/${collectionName}/*`;
  
  

  // Create the OpenSearch Serverless Collection
  const collection = new CfnCollection(scope, "MySearchCollection", {
    name: collectionName,
    type: "VECTORSEARCH",
  });

  // Create a security policy for encryption
  const encPolicy = new CfnSecurityPolicy(scope, "SecurityPolicy", {
    name: securityPolicyName,
    
    policy: JSON.stringify({
      Rules: [
        {
          ResourceType: "collection",
          Resource: [collectionResourceName],
        },
      ],
      AWSOwnedKey: true,
    }),
    type: "encryption",
  });
  collection.addDependency(encPolicy);

  // Public access policy for the collection
  const netPolicy = new CfnSecurityPolicy(scope, "ProductNetworkPolicy", {
    name: networkPolicyName,
    policy: JSON.stringify([
      {
        Rules: [
          {
            ResourceType: "collection",
            Resource: [collectionResourceName],
          },
          {
            ResourceType: "dashboard",
            Resource: [collectionResourceName],
          },
        ],
        AllowFromPublic: true,
      },
    ]),
    type: "network",
  });
  collection.addDependency(netPolicy);

  // Data access policy for collection management
  const dataAccessPolicy = new CfnAccessPolicy(scope, "MyCfnAccessPolicy", {
    name: dataAccessPolicyName,
    type: "data",
    policy: JSON.stringify([
      {
        Rules: [
          {
            Resource: [collectionResourceName],
            Permission: [
              "aoss:CreateCollectionItems",
              "aoss:DeleteCollectionItems",
              "aoss:UpdateCollectionItems",
              "aoss:DescribeCollectionItems",
            ],
            ResourceType: "collection",
          },
          {
            Resource: [indexResourceName],
            Permission: [
              "aoss:CreateIndex",
              "aoss:DeleteIndex",
              "aoss:UpdateIndex",
              "aoss:DescribeIndex",
              "aoss:ReadDocument",
              "aoss:WriteDocument",
            ],
            ResourceType: "index",
          },
        ],
        Principal: [
          `arn:aws:iam::${accountId}:role/aoss-lambda-api-executor-role`, // Correct ARN with accountId
          executorRole.roleArn, // Use executorRole ARN
          `arn:aws:iam::${accountId}:root`,
          //"arn:aws:iam::248189920021:user/202100332@stu.uob.edu.bh",
          // Add yours if needed
        ],
      },
    ]),
  });
  collection.addDependency(dataAccessPolicy);
  // Return the collection endpoint
  return { collectionEndpoint: collection.attrCollectionEndpoint, collectionArn: collection.attrArn };
}

// MyStack function to set up the IAM role, OpenSearch collection, and Lambda function
export function MyStack({ stack }: StackContext) {
  const stage = stack.stage; // Get the stage from the stack

  // Create the IAM role for Lambda execution
  const executorRole = new Role(stack, "ExecutorRole", {
    assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
    ],
  });

  const collectionName = getCollectionName(stage);
  const collectionResourceName = `collection/${collectionName}`;
  const indexResourceName = `index/${collectionName}/*`;
  // Add permissions to the executorRole for interacting with OpenSearch Serverless
  executorRole.addToPolicy(
    new PolicyStatement({
      actions: [
        "aoss:APIAccessAll",
        // "es:ESHttpPut"
        "aoss:CreateCollectionItems",
        "aoss:DeleteCollectionItems",
        "aoss:UpdateCollectionItems",
        "aoss:DescribeCollectionItems",
        "aoss:CreateIndex",
        "aoss:DeleteIndex",
        "aoss:UpdateIndex",
        "aoss:DescribeIndex",
        "aoss:ReadDocument",
        "aoss:WriteDocument",
        "secretsmanager:GetSecretValue"
      ],
      resources: [
        `arn:aws:aoss:${stack.region}:${stack.account}:${collectionResourceName}`, // Reference the collection
        `arn:aws:aoss:${stack.region}:${stack.account}:${indexResourceName}`, // Reference any index inside the collection
      ],
    })
  );

  // Add permissions for Secrets Manager
  executorRole.addToPolicy(
    new PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["arn:aws:secretsmanager:us-east-1:248189920021:secret:prod/access-keys-APbcDt"],
    })
  );

  // Create the OpenSearch resources and get the collection endpoint
  const {collectionEndpoint, collectionArn} = OpenSearchConstruct(stack, executorRole, stack.stage);

  // Define the Lambda function to create the vector index
  const createIndexLambda = new Function(stack, "CreateIndexLambda", {
    handler: "packages/functions/src/create-index.handler", // Path to the handler inside your Lambda code
    environment: {
      COLLECTION_NAME: collectionName, // Pass the collection name as an environment variable
      OPENSEARCH_ENDPOINT: collectionEndpoint, // Dynamically pass the OpenSearch endpoint
      REGION: stack.region, // Pass the AWS region as an environment variable
      SECRET_NAME: "prod/access-keys"
    },
    role: executorRole as any, // Use the executorRole for the Lambda function
  });
  
    // Add a custom resource to invoke the Lambda during deployment
    const customResource = new AwsCustomResource(stack, "CreateIndexResource", {
      onCreate: {
        physicalResourceId: PhysicalResourceId.of("CreateIndex"),
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: createIndexLambda.functionArn
        },
        region: stack.region,
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [createIndexLambda.functionArn],
        }),
      ]),
    });

    // await customResouce to ensure the Lambda function is invoked
    customResource.node.addDependency(createIndexLambda);
    


    // Export the Lambda function ARN and collection endpoint for reference
    stack.addOutputs({
      CreateIndexLambdaArn: createIndexLambda.functionArn,
      OpenSearchEndpoint: collectionEndpoint, // Output the OpenSearch endpoint
      LambdaResource: customResource.toString(),
      CollectionArn: collectionArn
    });  

  return { collectionEndpoint, customResource, collectionArn };
}
