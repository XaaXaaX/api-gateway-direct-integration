import { APIGatewayProxyEvent } from "aws-lambda";
export const handler = async (event: APIGatewayProxyEvent) => {
      const { letter } = JSON.parse(event.body);
  
      console.log("apigateway request for letter: ", letter)
};