import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ApiStack } from "./api/api";
import { ValidateRequestFunctionStack } from "./lambda/validateRequest/function";
import { TableStack } from "./database/dynamodbTable";
import { SharedProps } from "./lib/shared-props";

export interface AppProps extends SharedProps, StackProps {}

class AppStack extends Stack {
    constructor(scope: Construct, id: string, props: AppProps) {
        super(scope, id, props);

        const topic = new Topic(this, `${id}-topic` );
        const queue = new Queue(this, `${id}-queue` );
        const validateRequestFunction =  new ValidateRequestFunctionStack(this, ValidateRequestFunctionStack.name, { stackContext: props.stackContext});
        const table = new TableStack(this, TableStack.name, { stackContext: props.stackContext })
        const api = new ApiStack( this, ApiStack.name, {
            stackContext: props.stackContext,
            snsTopic: topic,
            sqsQueue: queue,
            validateRequet: validateRequestFunction.Function,
            dynamodbTable: table.Table
        });

        new CfnOutput(this, "TopicArn", { 
            value: topic.topicArn,
            exportName: `${id}-TopicArn`
        });
    }
}

export { AppStack };