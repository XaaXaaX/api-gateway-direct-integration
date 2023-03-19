import { APIGatewayProxyEvent } from "aws-lambda";
export const handler = async (event: APIGatewayProxyEvent) => {
    const { letter } = JSON.parse(event.body);
  
    console.log("apigateway request for letter: ", letter);
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({ done: true })
    };
};

function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }