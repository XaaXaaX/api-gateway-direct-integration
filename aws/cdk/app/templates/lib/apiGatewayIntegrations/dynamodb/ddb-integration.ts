
import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AwsIntegration, IntegrationOptions, IntegrationResponse, PassthroughBehavior } from "aws-cdk-lib/aws-apigateway";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { IRole } from "aws-cdk-lib/aws-iam";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

export interface IDynamoDbGatewayIntegrationProps {
  table: ITable;
  integrationRole: IRole;
}

export class DynamoDbGatewayIntegration extends Construct {
  public readonly integration: AwsIntegration; 
  constructor(scope: Construct, id: string, props: IDynamoDbGatewayIntegrationProps) {
    super(scope, id);

        props?.table.grantWriteData(props.integrationRole);
		const putItemIntegration = new AwsIntegration({
			action: 'PutItem',
			options: {
			  credentialsRole: props.integrationRole,
			  integrationResponses: [
				{
				  statusCode: '200',
				  responseTemplates: {
					'application/json': `{
					  "requestId": "$context.requestId"
					}`,
				  },
				}
			  ],
			  requestTemplates: {
				'application/json': `{
					"Item": {
					  "Id": {
						"S": "$context.requestId"
					  },
					  "letter": {
						"S": "$input.path('$.letter')"
					  }
					},
					"TableName": "${props?.table.tableName}"
				  }`
			  },
			},
			service: 'dynamodb',
		});

		this.integration = putItemIntegration;
  }
}
