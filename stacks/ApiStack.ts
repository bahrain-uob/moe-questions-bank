import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {
    // Use the DBStack to reference DynamoDB tables
    const { AllowedEmailsTable, FeedbackTable , ExamHistoryTable } = use(DBStack);

    // Create the HTTP API
    const api = new Api(stack, "Api", {
        defaults: {
            function: {
                // Bind both AllowedEmailsTable and FeedbackTable and HistoryTable to the API functions
                bind: [AllowedEmailsTable, FeedbackTable ,ExamHistoryTable],
                environment: {
                    FEEDBACK_TABLE: FeedbackTable.tableName, // Pass table name as an environment variable +ADD THE REST OF TABLES 
                    SNS_TOPIC_ARN: "<Your-SNS-Topic-ARN>", // Pass the SNS Topic ARN as an environment variable
                  },
            },
        },
        routes: {//callinh lambdas
            // Route for submitting feedback
            "POST /submit-feedback": "packages/functions/src/FeedbackSubmission.handler",
            // Route for generating exams
            "POST /generate-exam": "packages/functions/src/ask-question.handler",
            // Route for retrieving exam history
            //"GET /exam-history": "",

            // Sample TypeScript lambda function
           // "POST /": "packages/functions/src/lambda.main",
            // Sample Pyhton lambda function
          //  "GET /": {
            //    function: {
              //      handler: "packages/functions/src/sample-python-lambda/lambda.main",
                //    runtime: "python3.11",
                  //  timeout: "60 seconds",
              //  }
           // },
           
        },
        cors: true, // enable CORS
        
    });

     // Add API URL to the stack outputs
    stack.addOutputs({
      ApiUrl: api.url, // Outputs the URL of the created API
    });

    // cache policy to use with cloudfront as reverse proxy to avoid cors
    // https://dev.to/larswww/real-world-serverless-part-3-cloudfront-reverse-proxy-no-cors-cgj
    const apiCachePolicy = new CachePolicy(stack, "CachePolicy", {
        minTtl: Duration.seconds(0), // no cache by default unless backend decides otherwise
        defaultTtl: Duration.seconds(0),
        headerBehavior: CacheHeaderBehavior.allowList(
        "Accept",
        "Authorization",
        "Content-Type",
        "Referer"
        ),
    });

    return {api, apiCachePolicy}
}
