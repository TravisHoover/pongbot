'use strict';

const challenge = require('../commands/challenge');
const db = require('../utils/db');

describe('Challenge command tests', () => {
  test('Reject if challenger has not registered', async () => {
    const results = await challenge.challenge('challenger', 'opponent');
    expect(results).toContain('has not registered');
  })
  test('Reject if opponent has not registered', async () => {
    await db.putItem('Users', {username: 'challenger'});
    const results = await challenge.challenge('challenger', 'opponent');
    expect(results).toContain('has not registered');
  });
  test('Open a game if both participants have registered', async () => {
    await db.putItem('Users', {username: 'challenger'});
    await db.putItem('Users', {username: 'opponent'});
    const results = await challenge.challenge('challenger', 'opponent');
    expect(results).toContain('challenging');
  })
});
