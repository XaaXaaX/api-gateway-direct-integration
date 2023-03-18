import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
    for (const record of event.Records) {
      const { letter } = JSON.parse(record.body);
      console.log("sqs record for letter : ", letter)
    }
  };