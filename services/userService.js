const Cliente = require('../models/userModel');
const facturapiService = require('../apis/facturapi');

// Crear cliente en MongoDB y Facturapi
async function crearCliente(data) {
  const clienteFacturapi = await facturapiService.crearCliente(data);

  if (!clienteFacturapi || !clienteFacturapi.id) {
    throw new Error('No se pudo obtener el ID de Facturapi');
  }

  const clienteMongo = new Cliente({
    ...data,
    facturapiId: clienteFacturapi.id
  });

  await clienteMongo.save();
  return clienteMongo;
}


// Obtener todos los clientes desde Mongo
async function obtenerClientes() {
  return await Cliente.find();
}

// Obtener cliente por ID desde Mongo
async function obtenerClientePorId(id) {
  return await Cliente.findById(id);
}

// Actualizar cliente en Mongo y Facturapi
async function actualizarCliente(id, data) {
  const clienteMongo = await Cliente.findById(id);
  if (!clienteMongo) throw new Error('Cliente no encontrado');

  // Prepara address para Facturapi
  const { external, internal, ...addressSinExternalInternal } = data.address;

  await facturapiService.actualizarCliente(clienteMongo.facturapiId, {
    legal_name: data.legal_name,
    email: data.email,
    tax_id: data.rfc,
    address: {
      ...addressSinExternalInternal,
      exterior: external // Cambia aquí a 'exterior'
      // No incluyas 'internal'
    }
  });

  // Actualizar en Mongo
  return await Cliente.findByIdAndUpdate(id, data, { new: true });
}

// Eliminar cliente en Mongo y Facturapi
async function eliminarCliente(id) {
  const clienteMongo = await Cliente.findById(id);
  if (!clienteMongo) throw new Error('Cliente no encontrado');

  // Eliminar en Facturapi (usa .del, no .delete)
  await facturapiService.eliminarCliente(clienteMongo.facturapiId);

  // Eliminar en Mongo
  return await Cliente.findByIdAndDelete(id);
}
module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente
};
