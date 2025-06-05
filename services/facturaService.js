const Factura = require('../models/facturaModel');
const Client = require('../models/userModel');
const Facturapi = require('facturapi').default;

const facturapi = new Facturapi(process.env.FACTURAPI_KEY);

class FacturaService {
  /**
   * Busca un cliente por RFC. Si no existe, lo crea en Facturapi y lo guarda localmente.
   */
  async obtenerOCrearCliente(clienteInput) {
    const { legal_name, rfc, email, address } = clienteInput;

    // 1. Verificar si ya existe en la base de datos
    let cliente = await Client.findOne({ rfc });

    if (!cliente) {
      // 2. Crear cliente en Facturapi
      const clienteFacturapi = await facturapi.customers.create({
        legal_name,
        tax_id: rfc,
        tax_system: '616',
        email,
        address: {
          zip: address.zip,
          street: address.street,
          exterior: address.external,
          interior: address.internal,
          neighborhood: address.neighborhood,
          city: address.city,
          municipality: address.municipality,
          state: address.state,
          country: address.country
        }
      });

      // 3. Guardar cliente en MongoDB
      cliente = new Client({
        legal_name,
        rfc,
        email,
        address,
        facturapiId: clienteFacturapi.id
      });

      await cliente.save();
    }

    return cliente;
  }

  /**
   * Crea una factura en Facturapi y la guarda en MongoDB.
   */
  async crearFactura({ clienteInput, productos }) {
    // 1. Obtener o crear el cliente
    const cliente = await this.obtenerOCrearCliente(clienteInput);

    // 2. Preparar items para la API
    const items = productos.map(p => ({
      quantity: p.cantidad,
      product: {
        description: p.descripcion,
        product_key: p.claveProducto || '01010101',
        price: p.precio,
        taxes: [
          {
            type: 'IVA',
            rate: 0.16
          }
        ]
      }
    }));

    // 3. Crear factura en Facturapi
    const facturaFacturapi = await facturapi.invoices.create({
      customer: cliente.facturapiId,
      items,
      payment_form: "01", // Pago en una sola exhibición
      use: "G03",          // Gastos en general
      type: "I"            // Ingreso
    });

    // 4. Guardar en MongoDB
    const nuevaFactura = new Factura({
      folio: facturaFacturapi.folio_number,
      cliente: cliente._id,
      productos: productos.map(p => ({
        descripcion: p.descripcion,
        precio: p.precio,
        cantidad: p.cantidad,
        claveProducto: p.claveProducto,
        claveUnica: p.claveUnica || ''
      })),
      total: facturaFacturapi.total,
      fecha: facturaFacturapi.created_at,
      pdf_url: facturaFacturapi.pdf_url,
      xml_url: facturaFacturapi.xml_url,
      facturapi_id: facturaFacturapi.id
    });

    return await nuevaFactura.save();
  }

  /**
   * Obtener una factura por ID
   */
  async obtenerFacturaPorId(id) {
    const factura = await Factura.findById(id).populate('cliente');
    if (!factura) throw new Error('Factura no encontrada');
    return factura;
  }

  /**
   * Listar todas las facturas
   */
  async listarFacturas() {
    return await Factura.find().populate('cliente');
  }

  /**
   * Cancelar una factura en Facturapi
   */
  async cancelarFactura(id) {
    const factura = await Factura.findById(id);
    if (!factura) throw new Error('Factura no encontrada');

    try {
      await facturapi.invoices.cancel(factura.facturapi_id);
      return { mensaje: 'Factura cancelada correctamente' };
    } catch (error) {
      console.error('Error al cancelar factura:', error.message);
      throw new Error('No se pudo cancelar la factura');
    }
  }
}

module.exports = FacturaService;
