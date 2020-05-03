'use strict';
const db = require('../utils/db')

describe('DynamoDB tests', () => {
  it('should insert item into table', async () => {
    await db.putItem('Users', {username: 'test'});

    const {Item} = await db.getItem('Users', {username: 'test'});

    expect(Item).toEqual({
      username: 'test'
    });
  });
});
