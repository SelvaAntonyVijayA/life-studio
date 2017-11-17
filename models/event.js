var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var eventSchema = new Schema({
_id: Schema.Types.ObjectId,
}, {
  versionKey: false,
  collection: 'event',
  strict: false
});


module.exports = ilicore.model('Event', eventSchema);