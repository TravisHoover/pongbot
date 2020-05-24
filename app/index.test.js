
const index = require('./index.js');
const db = require('./utils/db');
const slackChallenge = require('../events/slackChallenge.json');
const registerMessage = require('../events/register.json');
const challengeMessage = require('../events/challenge.json');
const leaderboardMessage = require('../events/leaderboard.json');
const wonMessage = require('../events/won.json');
const acceptMessage = require('../events/accept.json');
const unrecognizedMessage = require('../events/unrecognized.json');
const helpMessage = require('../events/help.json');

jest.mock('./utils/slack.js');

describe('Core tests', () => {
  beforeEach(async () => {
    await db.clearGames();
    await db.clearUsers();
    await db.createTestUser('challenger');
    await db.createTestUser('opponent');
  });
  test('call getUsers', async () => {
    const users = await index.getUsers();
    expect(users).toHaveProperty('statusCode');
    expect(users.statusCode).toBe(200);
  });
  test('call getGames', async () => {
    const games = await index.getGames();
    expect(games).toHaveProperty('statusCode');
    expect(games.statusCode).toBe(200);
  });
  test('handle Slack challenge', async () => {
    const test = await index.slackHandler(slackChallenge);
    expect(test).toMatchObject({ statusCode: 200 });
    const body = JSON.parse(test.body);
    expect(body).toHaveProperty('challenge');
  });
  test('create response should format as expected', async () => {
    const body = { message: 'test' };
    const response = index.createResponse(200, body);
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('statusCode');
  });
  describe('Register case', () => {
    test('register a user', async () => {
      const response = await index.slackHandler(registerMessage);
      expect(response).toHaveProperty('statusCode');
      expect(response.body).toContain('registered');
    });
  });
  describe('Challenge case', () => {
    test('issuing a challenge', async () => {
      const challenge = await index.slackHandler(challengeMessage);
      expect(challenge.body).toContain('<@challenger> challenging <@opponent>');
    });
    test('make a challenge with an open game', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'open',
        },
      );
      const challenge = await index.slackHandler(challengeMessage);
      expect(challenge.body).toContain('A game is already in progress');
    });
    test('make a challenge to an opponent with a pending game', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'pending',
        },
      );
      const challenge = await index.slackHandler(challengeMessage);
      expect(challenge.body).toContain('already has a pending request');
    });
  });
  describe('Accept case', () => {
    test('handle accept command', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'pending',
        },
      );
      const result = await index.slackHandler(acceptMessage);
      expect(result.body).toContain('Challenge accepted');
      expect(result.statusCode).toBe(200);
    });
    test('handle no pending games', async () => {
      const result = await index.slackHandler(acceptMessage);
      expect(result.body).toContain('no pending games');
    });
    test('handle no pending challenges for this user', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'opponent',
          opponent: 'challenger',
          status: 'pending',
        },
      );
      const result = await index.slackHandler(acceptMessage);
      expect(result.body).toContain('No pending challenges');
    });
  });
  describe('Won case', () => {
    test('handle won command', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'open',
        },
      );
      const results = await index.slackHandler(wonMessage);
      expect(results.statusCode).toBe(200);
      expect(results.body).toContain('Game has been recorded');
    });
    test('handle won command with no open game', async () => {
      const openGame = await db.queryByIndex('Games', 'status-index', 'status', 'open');
      if (openGame.Count === 1) {
        await db.updateItem({
          TableName: 'Games',
          Key: {
            ID: openGame.Items[0].ID,
          },
          UpdateExpression: 'set #s = :s, winner = :w',
          ExpressionAttributeValues: {
            ':s': 'closed',
            ':w': 'challenger',
          },
          ExpressionAttributeNames: {
            '#s': 'status',
          },
        });
      }
      const results = await index.slackHandler(wonMessage);
      expect(results.body).toContain('No games in progress');
    });
  });
  describe('Leaderboard case', () => {
    test('handle leaderboard command', async () => {
      const results = await index.slackHandler(leaderboardMessage);
      expect(results).toHaveProperty('statusCode');
      expect(results.statusCode).toBe(200);
    });
  });
  describe('Help case', () => {
    test('handle help command', async () => {
      const results = await index.slackHandler(helpMessage);
      expect(results.statusCode).toBe(200);
      expect(results.body).toContain('Pongbot curates and records ping-pong games');
    });
  });
  test('Unrecognized command', async () => {
    const results = await index.slackHandler(unrecognizedMessage);
    expect(results).toHaveProperty('statusCode');
    expect(results.statusCode).toBe(200);
    expect(results).toHaveProperty('body');
    expect(results.body).toBe('"Command not recognized"');
  });
});
