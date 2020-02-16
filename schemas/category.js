var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    title: {type: String, required: true, min: 3, unique: true}
})

CategorySchema
.virtual("url")
.get(function() {
    return "/catalog/category/" + this._id;
});

// CategorySchema.plugin(uniqueValidator);

module.exports = mongoose.model("Category", CategorySchema);