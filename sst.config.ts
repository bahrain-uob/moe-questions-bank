import { SSTConfig } from "sst";
import { FrontendStack } from "./stacks/FrontendStack";
import { DBStack } from "./stacks/DBStack";
import { ApiStack } from "./stacks/ApiStack";
import { ImageBuilderForCodeCatalyst } from "./stacks/devops/ImageBuilderForCodeCatalyst";
import { OIDCForGitHubCI } from "./stacks/devops/OIDCForGitHubCI";
import { AuthStack } from "./stacks/AuthStack";
import { SNSStack } from "./stacks/SNSStack";

export default {
  config(_input) {
    return {
      name: "moe-questions-bank",
      region: "us-east-1",
    };
  },
  stacks(app) {
    // Remove all resources when non-prod stages are removed
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
    
    if (app.stage == 'devops-coca') {
      app.stack(ImageBuilderForCodeCatalyst)
    }
    else if (app.stage == 'devops-gh') {
      app.stack(OIDCForGitHubCI)
    }
    else {
      app.stack(DBStack)
      .stack(ApiStack)
      .stack(FrontendStack)
      .stack(AuthStack)
      .stack(SNSStack);

    }
  }
} satisfies SSTConfig;
