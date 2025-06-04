const { crearCliente, crearFactura } = require('../services/facturapiService');
const { generarResumenCompra } = require('../apis/openaiService');
const { enviarFacturaPorCorreo } = require('../services/emailService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const facturaResolvers = {
  Mutation: {
    crearCliente: async (_, { input }) => {
      try {
        return await crearCliente(input);
      } catch (error) {
        console.error('Error creando cliente:', error);
        throw new Error('No se pudo crear el cliente');
      }
    },

    emitirFactura: async (_, { input }) => {
      try {
        const { legal_name, rfc, email, productos } = input;

        // Crear cliente en Facturapi
        const cliente = await crearCliente({
          legal_name,
          rfc,
          email,
          address: {
            zip: "01000",
            street: "Calle Falsa",
            exterior: "123",
            neighborhood: "Centro",
            city: "CDMX",
            state: "Ciudad de México",
            country: "MEX"
          }
        });
        // Crear factura
        const factura = await crearFactura({ clienteId: cliente.id, productos });

        // Crear PDF personalizado
        const pdfUrl = factura.pdf_url;
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, `../temp/factura_${Date.now()}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(20).text('Factura Generada', { align: 'center' });
        doc.moveDown();
        doc.text(`Cliente: ${legal_name}`);
        doc.text(`RFC: ${rfc}`);
        doc.text(`Email: ${email}`);
        doc.moveDown();
        doc.text('Productos:');
        productos.forEach((p, i) => {
          doc.text(`${i + 1}. ${p.nombre} - $${p.precio} x ${p.cantidad}`);
        });

        const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        const resumen = await generarResumenCompra({ nombre: legal_name, productos, total });

        doc.moveDown();
        doc.text(`Total: $${total.toFixed(2)}`, { align: 'right' });
        doc.end();

        await new Promise((res, rej) => {
          writeStream.on('finish', res);
          writeStream.on('error', rej);
        });

        await enviarFacturaPorCorreo({ to: email, pdfPath: filePath });

        return {
          id: factura.id,
          cliente: { nombre: legal_name, rfc, email },
          productos,
          total,
          pdfUrl,
          resumen
        };
      } catch (error) {
        console.error('Error al emitir factura:', error);
        throw new Error('No se pudo emitir la factura');
      }
    }
  }
};

module.exports = facturaResolvers;
