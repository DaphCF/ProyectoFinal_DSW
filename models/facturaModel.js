const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema({
  folio_number: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  product: [{
    description: String,
    price: Number,
    quantity: Number,
    product_key: String,
    unit_key: String
  }],
  total: Number,
  pdf_url: String,
  xml_url: String,
  facturapi_id: String
}, { timestamps: true });

module.exports = mongoose.model('Factura', FacturaSchema);