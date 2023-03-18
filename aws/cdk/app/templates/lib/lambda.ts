import { resolve } from 'path';
import { Architecture, Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Duration, NestedStackProps } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SharedProps } from './shared-props';

export interface IndexFunctionProps extends SharedProps, NestedStackProps {
  lambdaContext: string;
  functionPath: string;
  description?: string;
  functionProps?: NodejsFunctionProps
}

export class IndexFunction extends NodejsFunction {
    private static readonly handlersPath = 'src/handlers';
    constructor(scope: Construct, id: string, props: IndexFunctionProps) {
        super(scope, id, {
            entry: resolve(`../../../${IndexFunction.handlersPath}/${props.functionPath}`),
            functionName: `${props.stackContext}-${props?.lambdaContext}-function`,
            memorySize: 128,
            architecture: Architecture.ARM_64,
            runtime: Runtime.NODEJS_16_X,
            timeout: Duration.seconds(15),
            handler: 'handler',
            logRetention: RetentionDays.ONE_DAY,
            tracing: Tracing.ACTIVE,
            bundling:{ externalModules:[ "aws-sdk" ]},
            ...props?.functionProps
        });
    }
}