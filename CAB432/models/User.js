const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },

  facebook: String,
  tokens: Array,

  name: String,
  gender: String,
  birthday: Date,
  picture: String

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;