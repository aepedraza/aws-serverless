import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "./snsClient.js";

export const handler = async (event) => {
    console.log("event:", JSON.stringify(event, undefined, 2));

    event.Records.forEach(async (record) => {
        console.log('Record: %j', record);

        console.log('Table Event : %j', record.eventName);

        // TODO: Missing package.json and dependencies
        try {
            const params = {
                Message: JSON.stringify(record.dynamodb),
                TopicArn: process.env.TOPIC_ARN,
            };
            console.log("params:", JSON.stringify(params, undefined, 2));
            const data = await snsClient.send(new PublishCommand(params));
            console.log("Successfully published SNS Message.", data);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Successfully published SNS Message: "${data}"`,
                    body: data
                })
            };
        } catch (e) {
            console.error(e);
            return {
                statusCode: 500,
                body: JSON.stringify({
                message: "Failed to perform operation.",
                errorMsg: e.message,
                errorStack: e.stack,
                })
            };        
        }
    });
};