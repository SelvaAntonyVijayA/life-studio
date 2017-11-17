var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var EventCategorySchema = new Schema({ _id: Schema.Types.ObjectId }, {
    versionKey: false,
    collection: 'eventcategory',
    strict: false
});


module.exports = ilicore.model('EventCategory', EventCategorySchema);