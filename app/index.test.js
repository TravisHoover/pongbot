'use strict';

const index = require('./index.js');
const db = require('./utils/db');
const slackChallenge = require('../events/slackChallenge.json');
const registerMessage = require('../events/register.json');
const challengeMessage = require('../events/challenge.json');
const leaderboardMessage = require('../events/leaderboard.json');
const wonMessage = require('../events/won.json');
const unrecognizedMessage = require('../events/unrecognized.json');

jest.mock('./utils/slack.js');

describe('Core tests', () => {
  test('call getUsers', async () => {
    const users = await index.getUsers();
    expect(users).toHaveProperty('statusCode');
    expect(users.statusCode).toBe(200);
  })
  test('call getGames', async () => {
    const games = await index.getGames();
    expect(games).toHaveProperty('statusCode');
    expect(games.statusCode).toBe(200);
  })
  test('handle Slack challenge', async () => {
    const test = await index.slackHandler(slackChallenge);
    expect(test).toMatchObject({statusCode: 200});
    const body = JSON.parse(test.body);
    expect(body).toHaveProperty('challenge');
  });
  test('create response should format as expected', async () => {
    const body = {message: 'test'};
    const response = index.createResponse(200, body);
    expect(typeof response).toBe('object');
    expect(response).toHaveProperty('statusCode');
  })
  describe('Register case', () => {
    test('register a user', async () => {
      const response = await index.slackHandler(registerMessage);
      expect(response).toHaveProperty('statusCode');
      expect(response.body).toContain('registered');
    })
  })
  describe('Challenge case', () => {
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
    })
  })
  describe('Won case', () => {
    test('handle won command', async () => {
      const results = await index.slackHandler(wonMessage);
      console.log('results', results);
      expect(results).toHaveProperty('statusCode');
    })
  })
  describe('Leaderboard case', () => {
    test('handle leaderboard command', async () => {
      const results = await index.slackHandler(leaderboardMessage);
      expect(results).toHaveProperty('statusCode');
      expect(results.statusCode).toBe(200);
    })
  })
  test('Unrecognized command', async () => {
    const results = await index.slackHandler(unrecognizedMessage);
    expect(results).toHaveProperty('statusCode');
    expect(results.statusCode).toBe(200);
    expect(results).toHaveProperty('body');
    expect(results.body).toBe('\"Command not recognized\"');
  })
})
