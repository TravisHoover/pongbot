const db = require('./utils/db');
const slack = require('./utils/slack');
const challengeHandler = require('./commands/challenge');
const leaderboardHandler = require('./commands/leaderboard');
const registerHandler = require('./commands/register');
const helpHandler = require('./commands/help');

const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

const createResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body) || '',
});

/**
 * Get Users
 * @returns {Promise<{body: string, statusCode: number}>|Promise<[]>}
 */
const getUsers = async () => {
  const users = await db.tableScan(usersTable);
  return createResponse(200, users);
};

/**
 * Get Games
 * @returns {Promise<{body: string, statusCode: number}>|Promise<[]>}
 */
const getGames = async () => {
  const games = await db.tableScan(gamesTable);
  return createResponse(200, games);
};

/**
 * Handler for Slack
 * @param event
 * @returns {*}
 */
const slackHandler = async (event) => {
  const request = JSON.parse(event.body);
  let response;
  const { user } = request.event;
  const message = request.event.text;
  const conversationId = request.event.channel;
  const splitMessage = message.split(' ');

  /**
   * To integrate with Slack
   * A 'challenge' must be made by Slack that sends a POST to the provided endpoint
   * This challenge must reply with the message sent to authenticate the bot.
   */
  if (request.challenge) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        challenge: request.challenge,
      }),
    };
  }

  const openGame = await db.queryByIndex(gamesTable, 'status-index', 'status', 'open');
  const pendingGame = await db.queryByIndex(gamesTable, 'status-index', 'status', 'pending');

  /**
   * This will be used as a unified way to accept commands and arguments
   * [0] Pongbot's user
   * [1] Command
   * [2] Opponent
   * @type {Array|*|string[]}
   */
  const command = splitMessage[1];
  const opponent = splitMessage[2];
  switch (command) {
    case 'register':
      response = await registerHandler.register(user);
      break;
    case 'challenge':
      if (openGame.Count > 0) {
        response = 'A game is already in progress.';
      }
      if (pendingGame.Items
        .some((game) => game.challenger === opponent || game.opponent === opponent)) {
        response = `@<${opponent} already has a pending request`;
      }
      response = await challengeHandler.challenge(user, opponent);
      break;
    case 'accept':
      if (pendingGame.Count < 1) {
        response = 'There are no pending games';
      }
      // eslint-disable-next-line no-case-declarations
      const pendingGameForThisUser = pendingGame.Items.find((game) => game.opponent === user);
      if (!pendingGameForThisUser) {
        response = 'No pending challenges';
      }
      response = await challengeHandler.accept(pendingGameForThisUser, user);
      break;
    case 'won':
      if (openGame.Count > 0) {
        response = await challengeHandler.won(openGame, user);
      } else response = 'No games in progress.';
      break;
    case 'leaderboard':
      response = await leaderboardHandler.getLeaderboard();
      break;
    case 'help':
      response = await helpHandler.getHelp();
      break;
    default:
      response = 'Command not recognized';
  }

  await slack.postMessage(conversationId, response);
  return createResponse(200, response);
};

module.exports = {
  createResponse,
  getGames,
  getUsers,
  slackHandler,
};
