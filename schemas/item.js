var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: {type: String, required: true, min: 3},
        description: {type: String},
        category: {type: Schema.Types.ObjectId, ref: "Category", required: true},
        price: {type: mongoose.Types.Decimal128, required: true, min: .01},
        stock: {type: Number, required: true, min: 0, max: 999}
    }
)

ItemSchema
.virtual("url")
.get(function(){
    return "/catalog/item/" + this._id;
})

// ItemSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Item", ItemSchema);