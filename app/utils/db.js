const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports = {

  getItem: async (table, key) => {
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
  },

  putItem: async (table, item) => {
    const params = {
      TableName: table,
      Item: item,
    };
    return dynamodb.put(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        return data;
      }
    }).promise();
  },

  queryByIndex: async (table, index, attribute, value) => {
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
  },

  tableScan: async (table) => {
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
  }
};
