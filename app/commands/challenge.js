const db = require('../utils/db');
const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

/**
 * Opens a game between two registered users
 * @param challenger
 * @param opponent
 * @returns {Promise<string>}
 */
const challenge = async (challenger, opponent) => {
  challenger = await db.getItem(usersTable, {username: challenger});
  opponent = await db.getItem(usersTable, {username: opponent.replace(/[<@>]/g, '')});

  if (Object.keys(challenger).length === 0) {
    return `${challenger} has not registered';`
  }
  if (Object.keys(opponent).length === 0) {
    return `${opponent} has not registered';`
  }

  await db.putItem(gamesTable,
    {
      ID: `${new Date()}`,
      challenger: challenger.Item.username,
      opponent: opponent.Item.username,
      status: 'open',
    },
  );

  return `<@${challenger.Item.username}> challenging <@${opponent.Item.username}>`;
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

  const loser = participants[0] !== user ? participants[0] : participants[1];

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
    ExpressionAttributeValues: {':inc': 1},
    UpdateExpression: 'SET wins = wins + :inc',
  };

  const loserParams = {
    TableName: usersTable,
    Key: {
      username: loser,
    },
    ExpressionAttributeValues: {':inc': 1},
    UpdateExpression: 'SET losses = losses + :inc',
  };

  await db.updateItem(gameParams);
  await db.updateItem(winnerParams);
  await db.updateItem(loserParams);
  return 'Game has been recorded.';
};

module.exports = {
  challenge,
  won,
}
