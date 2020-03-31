const db = require('../utils/db');
const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

module.exports.challenge = async (challenger, opponent) => {
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

module.exports.won = async (game, user) => {
  const params = {
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
  return await db.updateItem(params);
};
