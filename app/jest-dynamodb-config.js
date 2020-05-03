module.exports = {
  tables: [
    {
      TableName: `Users`,
      KeySchema: [{AttributeName: 'username', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'username', AttributeType: 'S'}],
      ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
    },
    {
      TableName: `Games`,
      KeySchema: [{AttributeName: 'ID', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'ID', AttributeType: 'S'}, {AttributeName: 'status', AttributeType: 'S'}],
      GlobalSecondaryIndexes: [{
        IndexName: 'status-index',
        KeySchema: [{AttributeName: 'status', KeyType: 'HASH'}],
        Projection: {ProjectionType: 'ALL'},
        ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}
      }],
      ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
    },
  ],
};
