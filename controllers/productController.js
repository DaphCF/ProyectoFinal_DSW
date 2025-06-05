const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../services/productService');

const productResolvers = {
  Query: {
    getProductos: async () => await obtenerProductos(),
    getProducto: async (_, { id }) => await obtenerProductoPorId(id)
  },
  Mutation: {
    createProducto: async (_, { input }) => await crearProducto(input),
    updateProducto: async (_, { id, input }) => await actualizarProducto(id, input),
    deleteProducto: async (_, { id }) => await eliminarProducto(id)
  }
};

module.exports = productResolvers;