const db = require('../utils/db');
const slack = require('../utils/slack');
const usersTable = process.env.USERS_TABLE;

module.exports.register = async (user, conversationId) => {
  const username = await db.getItem(usersTable, {username: {S: user}});
  if (Object.keys(username).length !== 0) {
    return slack.postMessage(conversationId, `<@${user}> already registered`);
  } else {
    const newUser = await db.putItem(usersTable, {username: {S: user}});
    if (newUser) {
      await slack.postMessage(conversationId, `<@${user}> registered`);
      return newUser;
    } else {
      await slack.postMessage(conversationId, `An error occurred when creating user`);
      return Promise.reject({message: 'Error creating user'});
    }
  }
};
