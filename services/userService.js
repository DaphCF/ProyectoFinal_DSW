const Cliente = require('../models/userModel'); 

async function crearCliente(data) {
  const cliente = new Cliente(data);
  await cliente.save();
  return cliente;
}

async function obtenerClientes() {
  return await Cliente.find();
}

async function obtenerClientePorId(id) {
  return await Cliente.findById(id);
}

async function actualizarCliente(id, data) {
  return await Cliente.findByIdAndUpdate(id, data, { new: true });
}

async function eliminarCliente(id) {
  return await Cliente.findByIdAndDelete(id);
}

module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
};