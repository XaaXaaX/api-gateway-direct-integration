
import { Construct } from "constructs";
import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
import { IRole } from "aws-cdk-lib/aws-iam";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";

export interface IStepFuncGatewayIntegrationProps {
  statemachine: IStateMachine;
  integrationRole: IRole;
}

export class StepFuncGatewayIntegration extends Construct {
  public readonly integration: AwsIntegration; 
  constructor(scope: Construct, id: string, props: IStepFuncGatewayIntegrationProps) {
        super(scope, id);

        props.statemachine.grantStartExecution(props.integrationRole);
        this.integration = new AwsIntegration({
            service: "states",
            action: "StartExecution",
            integrationHttpMethod: "POST",
            options: {
                credentialsRole: props.integrationRole,
                integrationResponses: [
                    {
                        statusCode: "200", 
                        responseTemplates: {
                        "application/json": `{"done": true}`,
                        },
                    },
                ],
                requestTemplates: {
                    "application/json": `{
                        "input": "{}", "stateMachineArn": "${props.statemachine.stateMachineArn}"
                    }`,
                },
            }
        });
    }
}
