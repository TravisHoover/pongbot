'use strict';

const index = require('./index.js');
const slackChallenge = require('../events/slackChallenge.json');
const registerMessage = require('../events/register.json');

jest.mock('./utils/slack.js');

describe('Core tests', () => {
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
})
