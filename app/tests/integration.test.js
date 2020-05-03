'use strict';

const index = require('../index.js');
const leaderboard = require('../commands/leaderboard.js');
const db = require('../utils/db')

describe('Integration tests', () => {
  describe('Users', () => {
    test('get users', async () => {
      const users = await index.getUsers();
      expect(users).toMatchObject({statusCode: 200});
    })
  })

  test('get games', async () => {
    const games = await index.getGames();
    expect(games).toMatchObject({statusCode: 200});
  })
  test('get leaderboard', async () => {
    const results = await leaderboard.getLeaderboard();
    expect(typeof results).toBe('string');
  })
  it('should insert item into table', async () => {
    await db
      .putItem('Users', {username: 'test'});

    const {Item} = await db.getItem('Users', {username: 'test'});

    expect(Item).toEqual({
      username: 'test'
    });
  });
});
