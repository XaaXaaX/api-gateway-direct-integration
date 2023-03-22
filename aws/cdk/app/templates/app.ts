import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Pass, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
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
        const table = new TableStack(this, TableStack.name, { stackContext: props.stackContext });
        const validateRequestFunction =  new ValidateRequestFunctionStack(this, ValidateRequestFunctionStack.name, { stackContext: props.stackContext});

        const stateMachine = new StateMachine(this, `${id}-MyStateMachine`, {
            definition: new Pass(this, 'PassState', { result: {value:"OK"} }),
            stateMachineType: StateMachineType.STANDARD
        });

        const eventBus = new EventBus(this, `${id}-MyEventBus`, {
            eventBusName: `${id}-MyEventBus`
          });
      
        const api = new ApiStack( this, ApiStack.name, {
            stackContext: props.stackContext,
            snsTopic: topic,
            sqsQueue: queue,
            validateRequet: validateRequestFunction.Function,
            dynamodbTable: table.Table,
            stateMachine: stateMachine,
            eventBus: eventBus
        });

        new CfnOutput(this, "ApiEndpoint", { 
            value: api.Api.url,
            exportName: `${id}-ApiEndpoint`
        });
    }
}

export { AppStack };