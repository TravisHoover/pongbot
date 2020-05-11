const db = require('../utils/db');

const usersTable = process.env.USERS_TABLE;

const getLeaderboard = async () => {
  const users = await db.tableScan(usersTable);
  let result = '';

  users.forEach((user) => {
    const formattedUser = `<@${user.username}> ${user.wins}\n`;
    result += formattedUser;
  });
  return result;
};

module.exports = {
  getLeaderboard,
};
