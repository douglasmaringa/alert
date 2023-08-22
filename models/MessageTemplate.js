const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'Up',
      'Down',
      'Registration',
      'PasswordReset',
      'DeleteAccount',
      'UserDeletion',
    ],
    required: true,
    unique: true,
  },
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);