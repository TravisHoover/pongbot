const db = require('../utils/db');
const usersTable = process.env.USERS_TABLE;

module.exports.getLeaderboard = async () => {
  const users = await db.tableScan(usersTable);
  return JSON.stringify(users);
};
