'use strict';

const challenge = require('../commands/challenge');
const db = require('../utils/db');

describe('Challenge command tests', () => {
  describe('Create a challenge', () => {
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
  })

  describe('Record a win', () => {
    test('record win', async () => {
      await db.putItem('Users', {
        username: 'challenger',
        wins: 0,
        losses: 0,
      });
      await db.putItem('Users', {
        username: 'opponent',
        wins: 0,
        losses: 0,
      });
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'open',
        },
      );
      const openGame = {
        Items: [
          {
            ID: 'testID',
            challenger: 'challenger',
            opponent: 'opponent',
            status: 'open',
          }
        ]
      }
      const results = await challenge.won(openGame, 'challenger');
      console.log('results', results);
    })
  })
});
