const db = require('../utils/db');
const usersTable = process.env.USERS_TABLE;

module.exports.register = async (user) => {
  const username = await db.getItem(usersTable, {username: user});
  if (Object.keys(username).length !== 0) {
    return `<@${user}> already registered`;
  } else {
    const newUser = await db.putItem(usersTable, {username: user, wins: 0});
    if (newUser) {
      return `<@${user}> registered`;
    } else {
      return `An error occurred when creating user`;
    }
  }
};
