const db = require('../utils/db');

const usersTable = process.env.USERS_TABLE;

const register = async (user) => {
  const username = await db.getItem(usersTable, { username: user });
  if (Object.keys(username).length !== 0) {
    return `<@${user}> already registered`;
  }
  await db.putItem(usersTable, { username: user, wins: 0, losses: 0 });
  return `<@${user}> registered`;
};

module.exports = {
  register,
};
