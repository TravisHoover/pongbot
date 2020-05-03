const AWS = require('aws-sdk');
const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env',
  }),
}
const dynamodb = new AWS.DynamoDB.DocumentClient(config);

const getItem = async (table, key) => {
  const params = {
    TableName: table,
    Key: key
  };
  return dynamodb.get(params, function (err, data) {
    if (err) {
      console.log('Error ', err);
    } else {
      return data.Item
    }
  }).promise();
};

const putItem = async (table, item) => {
  const params = {
    TableName: table,
    Item: item,
  };
  return dynamodb.put(params, function (err, data) {
    if (err) {
      console.log("Error", err);
      throw err.message;
    } else {
      return data;
    }
  }).promise();
};

const updateItem = async (params) => {
  return dynamodb.update(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      return data;
    }
  }).promise();
};

const queryByIndex = async (table, index, attribute, value) => {
  const key = `#${value}`;
  const attributeKey = `:v_${value}`;
  const params = {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: `${key} = ${attributeKey}`,
    ExpressionAttributeNames: {
      [key]: `${attribute}`
    },
    ExpressionAttributeValues: {
      [attributeKey]: `${value}`
    }
  };

  return dynamodb.query(params, function (err, data) {
    if (err) console.log(err);
    else {
      return data.Items;
    }
  }).promise();
};

const tableScan = async (table) => {
  const params = {
    TableName: table,
  };

  let scanResults = [];
  let items;
  do {
    items = await dynamodb.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey != "undefined");

  return scanResults;
};

module.exports = {
  getItem,
  putItem,
  updateItem,
  queryByIndex,
  tableScan,
}
