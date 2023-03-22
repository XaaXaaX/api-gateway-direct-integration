
import { Construct } from "constructs";
import { AwsIntegration } from "aws-cdk-lib/aws-apigateway";
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
		this.integration = new AwsIntegration({
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
  }
}
