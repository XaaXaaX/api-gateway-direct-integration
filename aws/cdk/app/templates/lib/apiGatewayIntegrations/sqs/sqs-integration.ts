import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AwsIntegration, IntegrationOptions, IntegrationResponse, PassthroughBehavior } from "aws-cdk-lib/aws-apigateway";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { IRole } from "aws-cdk-lib/aws-iam";
import { x_www_form_urlencoded } from "../../constants/httpContsnts";

export interface ISQSApiGatewayIntegrationProps {
  queue: IQueue;
  integrationRole: IRole;
}

export class SQSApiGatewayIntegration extends Construct {
  public readonly integration: AwsIntegration; 
  private static readonly sqsRequestTemplate = `Action=SendMessage&MessageBody=$util.urlEncode($input.body)`;

  constructor(scope: Construct, id: string, props: ISQSApiGatewayIntegrationProps) {
    super(scope, id);

    const response: IntegrationResponse = {
      statusCode: "200",
      responseTemplates: { "application/json": `{"done": true}` },
    };

    props?.queue.grantSendMessages(props.integrationRole);
    const integrationOptions: IntegrationOptions = {
      credentialsRole: props.integrationRole,
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestParameters: {"integration.request.header.Content-Type": x_www_form_urlencoded},
      requestTemplates: { "application/json": SQSApiGatewayIntegration.sqsRequestTemplate },
      integrationResponses: [response],
    };

    this.integration = new AwsIntegration({
      service: "sqs",
      path: `${Stack.of(this).account}/${props.queue.queueName}`,
      integrationHttpMethod: "POST",
      options: integrationOptions,
    });
  }
}