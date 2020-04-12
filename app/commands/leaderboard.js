const db = require('../utils/db');
const usersTable = process.env.USERS_TABLE;

module.exports.getLeaderboard = async () => {
  const users = await db.tableScan(usersTable);
  let result = '';

  users.forEach((user) => {
    const formattedUser = `
    <@${user.username}> ${user.wins}
    `;
    result += formattedUser;
  })
  return JSON.stringify(result);
};
