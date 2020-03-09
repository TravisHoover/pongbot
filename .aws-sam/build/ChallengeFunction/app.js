// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const { WebClient } = require('@slack/web-api');
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.challengeHandler = async (event, context) => {
    try {
        let body = 'hello world';
        // const ret = await axios(url);
        const request = JSON.parse(event.body);
        if (request.challenge) {
            body = request.challenge;
            response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    challenge: body,
                })
            }
        }

// An access token (from your Slack app or custom integration - xoxp, xoxb)
        const token = process.env.SLACK_TOKEN;
        const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
        const conversationId = request.event.channel;

        // See: https://api.slack.com/methods/chat.postMessage
        const slackMessage =  await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: slackMessage,
            })
        }
    } catch (err) {
        console.log(err);
        return {
            'statusCode': 400,
            'body': JSON.stringify({
                error: err,
            })
        }
    }
};
