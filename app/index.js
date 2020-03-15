const {WebClient} = require('@slack/web-api');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    sslEnabled: false,
    paramValidation: false,
    convertResponseTypes: false
});
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);
const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": JSON.stringify(body) || ""
    }
};

/**
 * Get Users
 * @returns {Promise<{body: string, statusCode: number}>|Promise<[]>}
 */
exports.getUsers = async () => {
    try {
        const params = {
            TableName: usersTable,
        };

        let scanResults = [];
        let items;
        do {
            items = await docClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");

        return createResponse(200, scanResults);
    } catch (err) {
        console.log(err);
        return createResponse(400, err);
    }
};

/**
 * Get Games
 * @returns {Promise<{body: string, statusCode: number}>|Promise<[]>}
 */
exports.getGames = async () => {
    try {
        const params = {
            TableName: gamesTable,
        };

        let scanResults = [];
        let items;
        do {
            items = await docClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");

        return createResponse(200, scanResults);
    } catch (err) {
        console.log(err);
        return createResponse(400, err)
    }
};

/**
 * Handler for Slack
 * @param event
 * @param context
 * @param callback
 * @returns {Promise<{body: string, statusCode: number}>}
 */
exports.slackHandler = async (event, context, callback) => {
    try {
        const request = JSON.parse(event.body);
        const user = request.event.user;
        const message = request.event.text;
        console.log('message', message);
        if (request.challenge) {
            return {
                'statusCode': 200,
                'body': JSON.stringify({
                    challenge: request.challenge,
                })
            }
        }

        // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
        const conversationId = request.event.channel;

        // See: https://api.slack.com/methods/chat.postMessage
        await web.chat.postMessage({channel: conversationId, text: `Hello <@${user}>`});
        return createResponse(200, request);
    } catch (err) {
        console.log(err);
        return createResponse(400, err);
    }
};
