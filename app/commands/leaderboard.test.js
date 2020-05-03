'use strict';

const leaderboard = require('../commands/leaderboard.js');

describe('Leaderboard command tests', () => {
  test('get leaderboard', async () => {
    const results = await leaderboard.getLeaderboard();
    expect(typeof results).toBe('string');
  })
});
