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
  it('should update items in table', async () => {
    await db.updateItem({
      TableName: 'Users',
      Key: {username: 'test'}
    });

    const {Item} = await db.getItem('Users', {username: 'test'});

    expect(Item).toEqual({
      username: 'test'
    });
  });
  it('should query by index', async () => {
    const result = await db.queryByIndex('Games', 'status-index', 'status', 'open');
    expect(result).toHaveProperty('Items');
  });
  it('should scan tables', async () => {
    const result = await db.tableScan('Users');
    expect(result).toHaveProperty('length');
  })
});
