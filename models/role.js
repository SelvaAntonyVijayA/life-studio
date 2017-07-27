var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var roleSchema = new Schema({ _id: Schema.Types.ObjectId }, {
    versionKey: false,
    collection: 'role',
    strict: false
});

module.exports = iliuser.model('Role', roleSchema);