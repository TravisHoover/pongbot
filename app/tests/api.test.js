
const index = require('../index.js');
const slack = require('../utils/slack');

jest.mock('../utils/slack.js');

describe('API Gateway tests', () => {
  test('get users', async () => {
    const users = await index.getUsers();
    expect(users).toMatchObject({ statusCode: 200 });
  });

  test('get games', async () => {
    const games = await index.getGames();
    expect(games).toMatchObject({ statusCode: 200 });
  });
});
describe('Slack integration', () => {
  test('send Slack message', async () => {
    const message = await slack.postMessage('foo', 'bar');
    expect(message).toContain('bar');
  });
});
