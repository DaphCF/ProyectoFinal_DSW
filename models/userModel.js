const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  zip: String,
  street: String,
  external: String,
  internal: String,
  neighborhood: String,
  city: String,
  municipality: String,
  state: String,
  country: String
});

const ClientSchema = new mongoose.Schema({
  legal_name: { type: String, required: true },
  rfc: { type: String, required: true, uppercase: true, unique: true, match: [/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/, 'RFC inválido'] },
  email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Email inválido'] },
  address: AddressSchema,
});

module.exports = mongoose.model('Client', ClientSchema);