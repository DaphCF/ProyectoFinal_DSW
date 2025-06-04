const Facturapi = require('facturapi'); // ✅
const facturapi = new Facturapi(process.env.FACTURAPI_KEY);

const crearCliente = async ({ nombre, rfc, email }) => {
  const cliente = await facturapi.customers.create({
    legal_name: nombre,
    tax_id: rfc,
    tax_system: '601', // Genérico, ajusta según sea necesario
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

module.exports = {
  crearCliente,
  crearFactura
};
