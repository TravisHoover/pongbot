const db = require("./utils/db");
const slack = require("./utils/slack");
const challengeHandler = require('./commands/challenge');
const leaderboardHandler = require('./commands/leaderboard');
const registerHandler = require('./commands/register');
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
        const users = await db.tableScan(usersTable);
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
        const games = await db.tableScan(gamesTable);
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
                request = await registerHandler.register(user, conversationId);
                break;
            case 'challenge':
                await slack.postMessage(conversationId, challengeHandler.challenge(user, splitMessage[2]));
                break;
            case 'leaderboard':
                await slack.postMessage(conversationId, leaderboardHandler.getLeaderboard());
                break;
            default:
                await slack.postMessage(conversationId, 'Command not recognized');
        }

        return createResponse(200, request);
    } catch (err) {
        console.log(err);
        return createResponse(400, err.message);
    }
};
