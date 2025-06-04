const Producto = require('../models/productModel'); 

async function crearProducto(data) {
  const producto = new Producto(data);
  await producto.save();
  return producto;
}

async function obtenerProductos() {
  return await Producto.find();
}

async function obtenerProductoPorId(id) {
  return await Producto.findById(id);
}

async function actualizarProducto(id, data) {
  return await Producto.findByIdAndUpdate(id, data, { new: true });
}

async function eliminarProducto(id) {
  return await Producto.findByIdAndDelete(id);
}

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};