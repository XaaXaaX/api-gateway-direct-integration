import { DynamoDBStreamEvent } from "aws-lambda";
import { AttributeValue } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb";

export type DynamoDbInternalRecord = { [key: string]: AttributeValue }

export const handler = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        const { letter } = unmarshall(record.dynamodb.NewImage as DynamoDbInternalRecord);
        console.log("Dynamodb stream record for letter : ", letter)
    }
};
