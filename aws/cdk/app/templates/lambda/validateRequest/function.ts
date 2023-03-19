import { Duration, NestedStack, NestedStackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SharedProps } from "../../lib/shared-props";
import { IndexFunction } from "../../lib/lambda";
interface ValidateRequestFunctionStackProps extends SharedProps, NestedStackProps { }

class ValidateRequestFunctionStack extends NestedStack {
    public readonly Function : IndexFunction;
    constructor(scope: Construct, id: string, props: ValidateRequestFunctionStackProps) {
        super(scope, id, props);

        this.Function =  new IndexFunction(
            this, 
            IndexFunction.name,
            { 
                stackContext: props.stackContext,
                lambdaContext: "validateRequest",
                functionPath: 'validateRequest/index.ts', 
                functionProps:{
                    memorySize: 256,
                    timeout: Duration.seconds(5)  
                }
            });
    }
}

export  { ValidateRequestFunctionStack };