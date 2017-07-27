var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var orgSchema = new Schema({ _id: Schema.Types.ObjectId }, {
        versionKey: false,
        collection: 'organization',
        strict: false
    });


module.exports = ilicore.model('Organization', orgSchema);