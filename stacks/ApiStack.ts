import { Api, StackContext, Topic, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(DBStack);

  const topic = new Topic(stack, "Report");
  // Create the HTTP API
  const api = new Api(stack, "Api", {
    // defaults: {
    //   authorizer: "iam",
    // },
    routes: {
      // Sample TypeScript lambda function
      "POST /generate": {
        function: {
          handler: "packages/functions/src/generateExam.generate",
          runtime: "nodejs20.x",
          timeout: "180 seconds",
          permissions: ["sagemaker"],
        },
      },

      "POST /feedback": {
        function: {
          handler: "packages/functions/src/feedback.handler",
          runtime: "nodejs20.x",
          timeout: "180 seconds",
          environment: {
            TOPIC_ARN: topic.topicArn, // Add the ARN to the environment
          },
          permissions: ["sns"],
        },
      },
    },
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

  return { api, apiCachePolicy };
}
