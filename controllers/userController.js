const { emitirFacturaHandler } = require('../apis/TwilioKey');
const {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} = require('../services/userService');
const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require('../services/productService');

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
    emitirFactura: async (_, { clienteId, productos }) => {
      const cliente = await obtenerClientePorId(clienteId);
      if (!cliente) throw new Error('Cliente no encontrado');

      const productosFacturapi = productos.map(p => ({
        description: p.descripcion,
        product_key: p.claveProducto || "01010101",
        price: p.precio,
        quantity: p.cantidad,
        unit_key: p.claveUnica || "E48"
      }));

      return await emitirFacturaHandler({
        cliente,
        productos: productosFacturapi
      });
    }
  }
};

module.exports = resolvers;