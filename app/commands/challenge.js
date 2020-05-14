const db = require('../utils/db');

const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

/**
 * Opens a game between two registered users
 * @param {string} challengerUsername
 * @param {string} opponentUsername
 * @returns {Promise<string>}
 */
const challenge = async (challengerUsername, opponentUsername) => {
  const challenger = await db.getItem(usersTable, { username: challengerUsername });
  const opponent = await db.getItem(usersTable, { username: opponentUsername.replace(/[<@>]/g, '') });

  if (Object.keys(challenger).length === 0) {
    return `${challenger} has not registered';`;
  }
  if (Object.keys(opponent).length === 0) {
    return `${opponent} has not registered';`;
  }

  await db.putItem(gamesTable,
    {
      ID: `${new Date()}`,
      challenger: challenger.Item.username,
      opponent: opponent.Item.username,
      status: 'pending',
    });

  return `<@${challenger.Item.username}> challenging <@${opponent.Item.username}>`;
};

const accept = async (game) => {
  const gameParams = {
    TableName: gamesTable,
    Key: {
      ID: game.ID,
    },
    UpdateExpression: 'set #s = :s',
    ExpressionAttributeValues: {
      ':s': 'open',
    },
    ExpressionAttributeNames: {
      '#s': 'status',
    },
  };
  await db.updateItem(gameParams);
  return 'Challenge accepted';
};

/**
 * Closes game and records winner.
 * Increases wins and losses counts on participants
 * @param game
 * @param user
 * @returns {Promise<string>}
 */
const won = async (game, user) => {
  const participants = [];
  participants.push(game.Items[0].challenger);
  participants.push(game.Items[0].opponent);

  const loserUsername = participants[0] !== user ? participants[0] : participants[1];
  const winner = await db.getItem(usersTable, { username: user });
  const loser = await db.getItem(usersTable, { username: loserUsername });

  const gameParams = {
    TableName: gamesTable,
    Key: {
      ID: game.Items[0].ID,
    },
    UpdateExpression: 'set #s = :s, winner = :w',
    ExpressionAttributeValues: {
      ':s': 'closed',
      ':w': `${user}`,
    },
    ExpressionAttributeNames: {
      '#s': 'status',
    },
  };

  const winnerParams = {
    TableName: usersTable,
    Key: {
      username: user,
    },
    ExpressionAttributeNames: { '#wins': 'wins' },
    ExpressionAttributeValues: { ':inc': winner.Item.wins + 1 },
    UpdateExpression: 'SET #wins = :inc',
  };

  const loserParams = {
    TableName: usersTable,
    Key: {
      username: loserUsername,
    },
    ExpressionAttributeNames: { '#losses': 'losses' },
    ExpressionAttributeValues: { ':inc': loser.Item.losses + 1 },
    UpdateExpression: 'SET #losses = :inc',
  };

  await db.updateItem(gameParams);
  await db.updateItem(winnerParams);
  await db.updateItem(loserParams);
  return 'Game has been recorded.';
};

module.exports = {
  challenge,
  accept,
  won,
};
