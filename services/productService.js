const Producto = require('../models/productModel');
const facturapiService = require('../apis/facturapi');

// Crear producto en Facturapi y luego en Mongo
async function crearProducto(data) {
  try {
    const productoFacturapi = await facturapiService.crearProducto({
      name: data.name,
      description: data.description,
      product_key: data.product_key,
      unit_key: data.unit_key,
      price: data.price,
    });

    console.log('Producto creado en Facturapi:', productoFacturapi);
  try {
    const productoFacturapi = await facturapiService.crearProducto({
      name: data.name,
      description: data.description,
      product_key: data.product_key,
      unit_key: data.unit_key,
      price: data.price,
    });

    console.log('Producto creado en Facturapi:', productoFacturapi);

    const producto = new Producto({
      ...data,
      facturapiId: productoFacturapi.id
    });
    const producto = new Producto({
      ...data,
      facturapiId: productoFacturapi.id
    });

    await producto.save();

    console.log('Producto guardado en Mongo:', producto);
    
    return producto;
  } catch (error) {
    console.error('Error en crearProducto:', error);
    throw new Error('Error al crear producto');
  }
}



// Obtener todos los productos
async function obtenerProductos() {
  return await Producto.find();
}

// Obtener un producto por ID
async function obtenerProductoPorId(id) {
  return await Producto.findById(id);
}

// Actualizar producto tanto en Mongo como en Facturapi
async function actualizarProducto(id, data) {
  const producto = await Producto.findById(id);
  if (!producto) throw new Error('Producto no encontrado');

  await facturapiService.actualizarProducto(producto.facturapiId, data);

  return await Producto.findByIdAndUpdate(id, data, { new: true });
}

// Eliminar producto tanto en Mongo como en Facturapi
async function eliminarProducto(id) {
  const producto = await Producto.findById(id);
  if (!producto) throw new Error('Producto no encontrado');

  await facturapiService.eliminarProducto(producto.facturapiId);

  return await Producto.findByIdAndDelete(id);
}

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
};