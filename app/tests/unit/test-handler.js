'use strict';

const index = require('../../index.js');
const chai = require('chai');
const expect = chai.expect;
let slackChallenge = require('../../../events/slackChallenge');

describe('Tests index', function () {
    it('handles Slack\'s authentication', async () => {
        const result = await index.slackHandler(slackChallenge);

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response).to.have.all.keys('challenge');
    });
});
