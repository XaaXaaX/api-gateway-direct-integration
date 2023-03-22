
import { Construct } from "constructs";
import { AwsIntegration, PassthroughBehavior } from "aws-cdk-lib/aws-apigateway";
import { IRole } from "aws-cdk-lib/aws-iam";
import { ITopic } from "aws-cdk-lib/aws-sns";
import { x_www_form_urlencoded } from "../../constants/httpContsnts";

export interface ISNSGatewayIntegrationProps {
  topic: ITopic;
  integrationRole: IRole;
}

export class SNSGatewayIntegration extends Construct {
  public readonly integration: AwsIntegration; 
  constructor(scope: Construct, id: string, props: ISNSGatewayIntegrationProps) {
    super(scope, id);

    props?.topic.grantPublish(props.integrationRole);

    this.integration = new AwsIntegration({
    	service: 'sns',
    	path:  `/sns`,
    	integrationHttpMethod: 'POST',
    	options: {
    	  credentialsRole: props.integrationRole,
    	  passthroughBehavior: PassthroughBehavior.NEVER,
    	  requestParameters: {
    		  'integration.request.header.Content-Type': x_www_form_urlencoded
    	  },
    	  requestTemplates: {
    		  'application/json': `Action=Publish&TopicArn=$util.urlEncode(\'${props?.topic.topicArn}\')&&Message=$util.urlEncode($input.body)`,
    	  },
    	  integrationResponses: [
            {
              statusCode: '200',
            },
            {
              statusCode: '400',
            },
            {
              statusCode: '500',
            }
          ]
    }});
  }
}
