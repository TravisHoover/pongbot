const db = require('../utils/db');
const leaderboard = require('./leaderboard.js');

describe('Leaderboard command tests', () => {
  test('get leaderboard', async () => {
    await db.putItem('Users', {
      username: 'challenger',
      wins: 1,
      losses: 1,
    });
    await db.putItem('Users', {
      username: 'opponent',
      wins: 1,
      losses: 1,
    });
    const results = await leaderboard.getLeaderboard();
    expect(results).toContain('<@challenger> 1');
    expect(results).toContain('<@opponent> 1');
  });
});
