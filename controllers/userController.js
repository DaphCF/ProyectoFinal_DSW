const { emitirFacturaHandler } = require('../apis/TwilioKey');
const {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} = require('../models/userModel');
const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../models/productModel');

const resolvers = {
  Query: {
    getClientes: async () => await obtenerClientes(),
    getCliente: async (_, { id }) => await obtenerClientePorId(id),
    getProductos: async () => await obtenerProductos(),
    getProducto: async (_, { id }) => await obtenerProductoPorId(id)
  },
  Mutation: {
    createCliente: async (_, { input }) => await crearCliente(input),
    updateCliente: async (_, { id, input }) => await actualizarCliente(id, input),
    deleteCliente: async (_, { id }) => await eliminarCliente(id),
    createProducto: async (_, { input }) => await crearProducto(input),
    updateProducto: async (_, { id, input }) => await actualizarProducto(id, input),
    deleteProducto: async (_, { id }) => await eliminarProducto(id),
    emitirFactura: async (_, { nombre, rfc, email, productos }) => {
      // Aquí puedes agregar validaciones si quieres

      return await emitirFacturaHandler({
        nombre,
        rfc,
        email,
        productos
      });
    }
  }
};

module.exports = resolvers;
