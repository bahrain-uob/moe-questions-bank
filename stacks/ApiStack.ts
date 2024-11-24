import { Api, StackContext, use } from "sst/constructs";
import { DBStack } from "./DBStack";
import { CacheHeaderBehavior, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib/core";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(DBStack);

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

      "POST /Feedback": {
        function: {
          handler: "packages/functions/src/Feedback.handler",
          runtime: "nodejs20.x",
          timeout: "180 seconds",
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
