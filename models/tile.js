var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var TileSchema = new Schema({ _id: Schema.Types.ObjectId }, {
    versionKey: false,
    collection: 'tile',
    strict: false
});


module.exports = ilicore.model('Tile', TileSchema);