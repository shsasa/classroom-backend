const mongoose = require('mongoose');

const userSchema = require('./User');
const batchSchema = require('./Batch');



module.exports = {
  User,
  Batch,
};
