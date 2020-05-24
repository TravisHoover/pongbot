const db = require('../utils/db');
const leaderboard = require('./leaderboard.js');

describe('Leaderboard command tests', () => {
  test('get leaderboard', async () => {
    await db.clearGames();
    await db.clearUsers();
    await db.createTestUser('challenger');
    await db.createTestUser('opponent');
    const results = await leaderboard.getLeaderboard();
    expect(results).toContain('<@challenger> 1');
    expect(results).toContain('<@opponent> 1');
  });
});
