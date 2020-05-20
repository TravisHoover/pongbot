const AWS = require('aws-sdk');

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  }),
};
const dynamodb = new AWS.DynamoDB.DocumentClient(config);

const getItem = async (table, key) => {
  const params = {
    TableName: table,
    Key: key,
  };
  return dynamodb.get(params, (err, data) => {
    if (err) return err;
    return data.Item;
  }).promise();
};

const putItem = async (table, item) => {
  const params = {
    TableName: table,
    Item: item,
  };
  return dynamodb.put(params, (err, data) => {
    if (err) return err;
    return data;
  }).promise();
};

const updateItem = async (params) => dynamodb.update(params, (err, data) => {
  if (err) return err;
  return data;
}).promise();

const queryByIndex = async (table, index, attribute, value) => {
  const key = `#${value}`;
  const attributeKey = `:v_${value}`;
  const params = {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: `${key} = ${attributeKey}`,
    ExpressionAttributeNames: {
      [key]: `${attribute}`,
    },
    ExpressionAttributeValues: {
      [attributeKey]: `${value}`,
    },
  };

  return dynamodb.query(params, (err, data) => {
    if (err) return err;
    return data.Items;
  }).promise();
};

const tableScan = async (table) => {
  const params = {
    TableName: table,
  };

  const scanResults = [];
  let items;
  do {
    // eslint-disable-next-line no-await-in-loop
    items = await dynamodb.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== 'undefined');

  return scanResults;
};

/**
 * Deletes all items in the Games table
 * @returns {Promise<[]>}
 */
const clearGames = async () => {
  const scanResults = [];
  const items = await dynamodb.scan({
    TableName: 'Games',
  }).promise();
  const deleteParams = items.Items.map((item) => ({
    DeleteRequest: {
      Key: { ID: item.ID },
    },
  }));
  const params = {
    RequestItems: {
      Games: deleteParams,
    },
  };
  if (params.RequestItems.Games.length > 0) {
    await dynamodb
      .batchWrite(params)
      .promise();
  }
  return scanResults;
};

module.exports = {
  clearGames,
  getItem,
  putItem,
  updateItem,
  queryByIndex,
  tableScan,
};
