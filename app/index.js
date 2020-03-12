const {WebClient} = require('@slack/web-api');
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const usersTable = process.env.USERS_TABLE;
let response;

const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": JSON.stringify(body) || ""
    }
};
/**
 * Handler for Slack's challenge
 * @param event
 * @param context
 * @param callback
 * @returns {Promise<{body: string, statusCode: number}>}
 */
exports.challengeHandler = async (event, context, callback) => {
    try {
        let body = 'hello world';
        const request = JSON.parse(event.body);
        var params = {
            "TableName": usersTable,
            "Key": {
                id: '2323'
            }
        };
        if (request.challenge) {
            body = request.challenge;
            response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    challenge: body,
                })
            }
        }
        dynamo.getItem(params, (err, data) => {
            let response;
            if (err)
                response = createResponse(500, err);
            else
                response = createResponse(200, data.Item ? data.Item : null);
            callback(null, response);
        });

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
        const conversationId = request.event.channel;

        // See: https://api.slack.com/methods/chat.postMessage
        const slackMessage = await web.chat.postMessage({channel: conversationId, text: 'Hello there'});
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: slackMessage,
            })
        }
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 400,
            'body': JSON.stringify({
                error: err,
            })
        }
    }
};
