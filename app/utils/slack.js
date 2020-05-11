const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

/**
 * Post message to slack channel
 * @param conversationId
 * @param message
 * @returns {Promise<void>}
 */
const postMessage = async (conversationId, message) => {
  await web.chat.postMessage({ channel: conversationId, text: message });
};

module.exports = {
  postMessage,
};
