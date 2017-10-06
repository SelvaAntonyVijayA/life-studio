var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var TileCategorySchema = new Schema({ _id: Schema.Types.ObjectId }, {
    versionKey: false,
    collection: 'tilecategory',
    strict: false
});


module.exports = ilicore.model('TileCategory', TileCategorySchema);