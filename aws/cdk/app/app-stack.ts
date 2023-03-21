import { App } from "aws-cdk-lib";
import { AppStack } from "./templates/app"

const app = new App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};
const application = app.node.tryGetContext("application");
const environment = app.node.tryGetContext("environment");
const scope = app.node.tryGetContext("scope");

const stackContext = `${application}-${environment}`;
const resourceBaseId = `${stackContext}-${scope}`;

new AppStack(app, resourceBaseId, {
  stackContext: stackContext
});
