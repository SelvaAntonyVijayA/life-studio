var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var pageSchema = new Schema({
_id: Schema.Types.ObjectId,
}, {
  versionKey: false,
  collection: 'page',
  strict: false
});


module.exports = ilicore.model('Page', pageSchema);