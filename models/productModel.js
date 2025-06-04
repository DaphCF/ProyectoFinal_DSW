const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: { type: String, required: true },
  price: { type: Number, required: true, min: [0, 'El precio debe ser mayor o igual a 0'] },
  quantity: { type: Number, required: true, min: [0, 'La cantidad mínima es 0'] },
  product_key: { type: String, required: true }, // Clave SAT
  unit_key: { type: String, required: true }, // Unidad SAT
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);