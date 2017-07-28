var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var domainSchema = new Schema({ _id: Schema.Types.ObjectId }, {
        versionKey: false,
        collection: 'domains',
        strict: false
    });


module.exports = ilicore.model('Domains', domainSchema);