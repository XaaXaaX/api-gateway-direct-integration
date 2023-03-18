import { NestedStack, NestedStackProps, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, StreamViewType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { SharedProps } from "../lib/shared-props";

interface TableStackProps extends SharedProps, NestedStackProps { }

export class TableStack extends NestedStack {
    public readonly Table: ITable;

    constructor(scope: Construct, id: string, props: TableStackProps) {
        super(scope, id, props);

        this.Table = new Table(this, Table.name, { 
            tableName: `${props.stackContext}-table`,
            partitionKey: { 
                name: 'Id', 
                type: AttributeType.STRING 
            }, 
            sortKey: { 
                name: "letter", 
                type: AttributeType.STRING
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            stream: StreamViewType.NEW_IMAGE,
            encryption: TableEncryption.AWS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY
        });
    }
}