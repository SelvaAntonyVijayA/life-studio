var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  email: 'string',
  password: 'string'
}, {
    versionKey: false,
    collection: 'orgmembers',
    strict: false
  });


module.exports = iliuser.model('User', userSchema);