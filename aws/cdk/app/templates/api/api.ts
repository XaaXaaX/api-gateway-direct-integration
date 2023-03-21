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
import { SharedProps } from "../lib/shared-props";
import { SNSGatewayIntegration } from "../lib/apiGatewayIntegrations/sns/sns-integration";

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

		const snsIntegration = new SNSGatewayIntegration(
            this,
            SNSGatewayIntegration.name,
            {
                topic: props.snsTopic,
                integrationRole: integrationRole,
            }
        );

        const sqsApiResource = this.Api.root.addResource('sqs');
        sqsApiResource.addMethod(
            'POST', 
            sqsIntegration.integration,
            { methodResponses: [{ statusCode: "200" }] }
        );
        
        const snsApiResource = this.Api.root.addResource('sns');
        snsApiResource.addMethod(
            'POST', 
            snsIntegration.integration,
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