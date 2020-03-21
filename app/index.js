const challengeHandler = require('./commands/challenge');
const leaderboardHandler = require('./commands/leaderboard');

const {WebClient} = require('@slack/web-api');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
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

const tableScan = async (table) => {
    const params = {
        TableName: table,
    };

    let scanResults = [];
    let items;
    do {
        items = await dynamodb.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey != "undefined");

    return scanResults;
};

const getItem = async (table, key) => {
    const params = {
        TableName: table,
        Key: key
    };
    return dynamodb.getItem(params).promise();
};

const putItem = async (table, item) => {
    const params = {
        TableName: table,
        Item: item,
    };
    return dynamodb.putItem(params).promise();
};

/**
 * Get Users
 * @returns {Promise<{body: string, statusCode: number}>|Promise<[]>}
 */
exports.getUsers = async () => {
    try {
        const users = await tableScan(usersTable);
        return createResponse(200, users);
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
        const games = await tableScan(gamesTable);
        return createResponse(200, games);
    } catch (err) {
        console.log(err);
        return createResponse(400, err)
    }
};

/**
 * Handler for Slack
 * @param event
 * @returns {*}
 */
exports.slackHandler = async (event) => {
    try {
        let request = JSON.parse(event.body);
        const user = request.event.user;
        const message = request.event.text;
        if (request.challenge) {
            return {
                'statusCode': 200,
                'body': JSON.stringify({
                    challenge: request.challenge,
                })
            }
        }

        const conversationId = request.event.channel;
        const splitMessage = message.split(" ");

        /**
         * This will be used as a unified way to accept commands and arguments
         * [0] Pongbot's user
         * [1] Command
         * [2] Opponent
         * @type {Array|*|string[]}
         */
        switch (splitMessage[1]) {
            case 'register':
                const username = await getItem(usersTable, {Username: {S: user}});
                if (Object.keys(username).length !== 0) {
                    request = await web.chat.postMessage({
                        channel: conversationId,
                        text: `<@${user}> already registered`
                    });
                } else {
                    const newUser = await putItem(usersTable, {Username: {S: user}});
                    if (newUser) {
                        await web.chat.postMessage({channel: conversationId, text: `<@${user}> registered`});
                        request = newUser;
                    } else {
                        await web.chat.postMessage({
                            channel: conversationId,
                            text: `An error occurred when creating user`
                        });
                        return createResponse(400, 'Error creating user');
                    }
                }
                break;
            case 'challenge':
                await web.chat.postMessage({
                    channel: conversationId,
                    text: challengeHandler.challenge(user, splitMessage[2])
                });
                break;
            case 'leaderboard':
                await web.chat.postMessage({channel: conversationId, text: leaderboardHandler.getLeaderboard()});
                break;
            default:
                await web.chat.postMessage({channel: conversationId, text: 'Command not recognized'});
        }

        return createResponse(200, request);
    } catch (err) {
        console.log(err);
        return createResponse(400, err.message);
    }
};
