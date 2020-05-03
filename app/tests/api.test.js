'use strict';

const index = require('../index.js');

describe('API Gateway tests', () => {
  test('get users', async () => {
    const users = await index.getUsers();
    expect(users).toMatchObject({statusCode: 200});
  })

  test('get games', async () => {
    const games = await index.getGames();
    expect(games).toMatchObject({statusCode: 200});
  })
});
