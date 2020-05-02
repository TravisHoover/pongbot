'use strict';

const index = require('../index.js');
const slackChallenge = require('../../events/slackChallenge');

describe('Unit tests', () => {
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
})
