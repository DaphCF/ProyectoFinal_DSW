const Facturapi = require('facturapi').default; // ✅
const facturapi = new Facturapi(process.env.FACTURAPI_KEY);

const crearCliente = async ({ legal_name, rfc, email }) => {
  const cliente = await facturapi.customers.create({
    legal_name,
    tax_id: rfc,
    tax_system: '616',
    email,
    address: {
      zip: '01000',
      street: 'Calle Falsa',
      exterior: '123',
      neighborhood: 'Centro',
      city: 'CDMX',
      state: 'Ciudad de México',
      country: 'MEX'
    }
  });
  return cliente;
};

const crearFactura = async ({ clienteId, productos }) => {
  const items = productos.map(p => ({
    quantity: p.cantidad,
    product: {
      description: p.nombre,
      product_key: '01010101',
      price: p.precio,
      taxes: [
        {
          type: 'IVA',
          rate: 0.16
        }
      ]
    }
  }));

  const factura = await facturapi.invoices.create({
    customer: clienteId,
    items,
    payment_form: "01",
    use: "G03",
    type: "I"
  });
  return factura;
  
};

  // CLIENTES
  const actualizarCliente = async (id, input) => {
    return await facturapi.customers.update(id, {
      legal_name: input.legal_name,
      email: input.email,
      tax_id: input.tax_id,
      tax_system: '616',
      address: input.address
    });
  };

async function eliminarCliente(facturapiId) {
  return await facturapi.customers.del(facturapiId);
}

  // PRODUCTOS
const crearProducto = async ({ name, description, product_key, unit_key, price }) => {
  return await facturapi.products.create({
    name,                 
    description,
    product_key,
    unit_key,              
    price,
    taxes: [
      {
        type: 'IVA',
        rate: 0.16
      }
    ]
  });
};


  const actualizarProducto = async (id, input) => {
    return await facturapi.products.update(id, {
      description: input.description,
      product_key: input.product_key,
      price: input.price,
      taxes: [
        {
          type: 'IVA',
          rate: 0.16
        }
      ]
    });
  };

  const eliminarProducto = async (id) => {
    return await facturapi.products.del(id);
  };

  module.exports = {
    crearCliente,
    crearFactura,
    actualizarCliente,
    eliminarCliente,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  };

