var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var TileBlockSchema = new Schema({ _id: Schema.Types.ObjectId }, {
    versionKey: false,
    collection: 'tileblocks',
    strict: false
});


module.exports = ilicore.model('TileBlock', TileBlockSchema);