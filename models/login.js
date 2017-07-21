var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var loginSchema = new Schema({
    email: 'string',
    password: 'string'
}, {
        versionKey: false,
        collection: 'orgmembers',
        strict: false
    });


module.exports = iliuser.model('Login', loginSchema);