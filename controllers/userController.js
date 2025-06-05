const { emitirFacturaHandler } = require('../apis/TwilioKey');
const {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
} = require('../services/userService');

const userResolvers = {
  Query: {
    getClientes: async () => await obtenerClientes(),
    getCliente: async (_, { id }) => await obtenerClientePorId(id)
  },
  Mutation: {
    createCliente: async (_, { input }) => await crearCliente(input),
    updateCliente: async (_, { id, input }) => await actualizarCliente(id, input),
    deleteCliente: async (_, { id }) => await eliminarCliente(id),
    emitirFactura: async (_, { nombre, rfc, email, productos }) => {

      return await emitirFacturaHandler({
        nombre,
        rfc,
        email,
        productos
      });
    }
  }
};

module.exports = userResolvers;

