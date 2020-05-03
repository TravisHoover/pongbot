'use strict';

const index = require('./index.js');
const slackChallenge = require('../events/slackChallenge.json');
const registerMessage = require('../events/register.json');
const challengeMessage = require('../events/challenge.json');

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
  test('register a user', async () => {
    const response = await index.slackHandler(registerMessage);
    expect(response).toHaveProperty('statusCode');
    expect(response.body).toContain('registered');
  })
  test('make a challenge as an unregistered user', async () => {
    const challenge = await index.slackHandler(challengeMessage);
    expect(challenge).toContain('has not registered');
  })
})
