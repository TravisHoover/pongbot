const challenge = require('./challenge');
const db = require('../utils/db');

describe('Challenge command tests', () => {
  beforeEach(async () => {
    await db.clearGames();
    await db.clearUsers();
    await db.createTestUser('challenger');
    await db.createTestUser('opponent');
  });
  describe('Create a challenge', () => {
    test('Reject if challenger has not registered', async () => {
      const results = await challenge.challenge('nobody', 'opponent');
      expect(results).toContain('has not registered');
    });
    test('Reject if opponent has not registered', async () => {
      const results = await challenge.challenge('challenger', 'nobody');
      expect(results).toContain('has not registered');
    });
    test('Open a game if both participants have registered', async () => {
      const results = await challenge.challenge('challenger', 'opponent');
      expect(results).toContain('challenging');
    });
  });

  describe('Accepting challenges', () => {
    test('should accept a challenge', async () => {
      await db.putItem(
        'Games',
        {
          ID: 'testID',
          challenger: 'challenger',
          opponent: 'opponent',
          status: 'pending',
        },
      );
      const pendingGame = await db.queryByIndex('Games', 'status-index', 'status', 'pending');
      const results = await challenge.accept(pendingGame.Items[0], 'opponent');
      expect(results).toBe('Challenge accepted');
    });
  });

  describe('Record a win', () => {
    test('record win', async () => {
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
          },
        ],
      };
      const results = await challenge.won(openGame, 'challenger');
      expect(results).toBe('Game has been recorded.');
      const updatedChallenger = await db.getItem('Users', { username: 'challenger' });
      const updatedOpponent = await db.getItem('Users', { username: 'opponent' });
      expect(updatedChallenger.Item.wins).toBe(2);
      expect(updatedOpponent.Item.losses).toBe(2);
    });
  });
});
