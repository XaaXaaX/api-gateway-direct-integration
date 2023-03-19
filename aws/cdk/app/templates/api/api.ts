import { Construct } from "constructs";
import { NestedStack, NestedStackProps } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { AccessLogFormat, EndpointType, LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { ITopic } from "aws-cdk-lib/aws-sns";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { SQSApiGatewayIntegration } from "../lib/apiGatewayIntegrations/sqs/sqs-integration";
import { SharedProps } from "templates/lib/shared-props";

interface ApiStackProps extends SharedProps, NestedStackProps { 
    validateRequet: IFunction,
    sqsQueue: IQueue,
    snsTopic: ITopic,
    dynamodbTable: ITable
}

class ApiStack extends NestedStack {
    public readonly Api: RestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const apiLogGroup = new LogGroup(this, 'ApiLogGroup', {  retention: RetentionDays.ONE_WEEK });
        const integrationRole = new Role(this, 'integration-role', { assumedBy: new ServicePrincipal('apigateway.amazonaws.com') });

        this.Api = new RestApi(
            this,
            RestApi.name, 
            {
                restApiName: `${props.stackContext}-rest-api`,
                endpointTypes: [EndpointType.REGIONAL],
                cloudWatchRole: true,
                deployOptions: {
                    accessLogDestination: new LogGroupLogDestination(apiLogGroup),
                    accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                    loggingLevel: MethodLoggingLevel.INFO,
                    metricsEnabled: true,
                    tracingEnabled: true,
                    dataTraceEnabled: false,
                    stageName: 'live'
                },
            });

		props?.sqsQueue.grantSendMessages(integrationRole);
        const sqsIntegration = new SQSApiGatewayIntegration(
            this,
            SQSApiGatewayIntegration.name,
            {
              queue: props.sqsQueue,
              integrationRole: integrationRole,
            }
        );

		props?.snsTopic.grantPublish(integrationRole);

		// const publishIntegration = new AwsIntegration({
		// 	service: 'sns',
		// 	path:  `/sns`,
		// 	integrationHttpMethod: 'POST',
		// 	options: {
		// 	  credentialsRole: integrationRole,
		// 	  passthroughBehavior: PassthroughBehavior.NEVER,
		// 	  requestParameters: {
		// 		'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'"
		// 	  },
		// 	  requestTemplates: {
		// 		'application/json': `Action=Publish&TopicArn=$util.urlEncode(\'${props?.snsTopic.topicArn}\')`,
		// 	  },
		// 	  integrationResponses: [
        //         {
        //           statusCode: '200',
        //         },
        //         {
        //           statusCode: '400',
        //         },
        //         {
        //           statusCode: '500',
        //         }
        //       ]
		// }});

		// props?.dynamodbTable.grantWriteData(integrationRole);
		// const putItemIntegration = new AwsIntegration({
		// 	action: 'PutItem',
		// 	options: {
		// 	  credentialsRole: integrationRole,
		// 	  integrationResponses: [
		// 		{
		// 		  statusCode: '200',
		// 		  responseTemplates: {
		// 			'application/json': `{
		// 			  "requestId": "$context.requestId"
		// 			}`,
		// 		  },
		// 		}
		// 	  ],
		// 	  requestTemplates: {
		// 		'application/json': `{
		// 			"Item": {
		// 			  "Id": {
		// 				"S": "$context.requestId"
		// 			  },
		// 			  "letter": {
		// 				"S": "$input.path('$.letter')"
		// 			  }
		// 			},
		// 			"TableName": "${props?.dynamodbTable.tableName}"
		// 		  }`
		// 	  },
		// 	},
		// 	service: 'dynamodb',
		// });

        const sqsApiResource = this.Api.root.addResource('sqs');
        sqsApiResource.addMethod(
            'POST', 
            sqsIntegration.integration,
            { methodResponses: [{ statusCode: "200" }] }
            );
        
        const lambdaProxyIntegration = new LambdaIntegration(props.validateRequet);
        const lambdaApiResource = this.Api.root.addResource('lambda');
        lambdaApiResource.addMethod(
            'POST', 
            lambdaProxyIntegration);
    }
}

export { ApiStack };