const {WebClient} = require('@slack/web-api');
const doc = require('dynamodb-doc');
const dynamo = new doc.DynamoDB();
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
let response;

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

        return {
            'statusCode': 200,
            'body': JSON.stringify(scanResults),
        };
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

        return {
            'statusCode': 200,
            'body': JSON.stringify(scanResults),
        };
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
        const params = {
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
