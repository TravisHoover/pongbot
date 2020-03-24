const db = require('../utils/db');
const slack = require('../utils/slack');
const usersTable = process.env.USERS_TABLE;
const gamesTable = process.env.GAMES_TABLE;

module.exports.challenge = async (challenger, opponent) => {
  challenger = await db.getItem(usersTable, {username: {S: challenger}});
  opponent = await db.getItem(usersTable, {username: {S: opponent.replace(/[<@>]/g, '')}});
  console.log('opponent', opponent);
  if (Object.keys(challenger).length === 0) {
    return `${challenger} has not registered';`
  }
  if (Object.keys(opponent).length === 0) {
    return `${opponent} has not registered';`
  }

  await db.putItem(gamesTable,
    {
      challenger:
        {
          S: challenger
        },
      opponent:
        {
          S: opponent
        },
    },
  );

  return `<@${challenger}> challenging ${opponent}, but not yet implemented`;
};
