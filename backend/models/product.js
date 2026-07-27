const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, lowercase: true }, // lowercase se skirt/skirts ka chakkar khatam
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: null },
  description: { type: String, default: "" },
  image: { type: String, required: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);