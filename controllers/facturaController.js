// controllers/facturaController.js
const FacturaService = require('../services/facturaService');
const { generarResumenCompra } = require('../apis/openaiService');
const { enviarFacturaPorCorreo } = require('../services/emailService');
const { enviarSMS, enviarWhatsApp } = require('../services/notificacionService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Instanciar el servicio
const facturaService = new FacturaService();

const facturaResolvers = {
  Mutation: {
    emitirFactura: async (_, { input }) => {
      try {
        const { legal_name, rfc, email, numero, productos } = input;

        const cliente = await crearCliente({
          legal_name,
          rfc,
          email,
          address: {
            zip: "00000",
            street: "Calle Principal",
            external: "123",
            internal: "",
            neighborhood: "Centro",
            city: "Ciudad",
            municipality: "Municipio",
            state: "Estado",
            country: "MEX"
          }
        });

        const factura = await crearFactura({ clienteId: cliente.id, productos });

        const pdfUrl = factura.pdf_url;
        const doc = new PDFDocument();
        const timestamp = Date.now();
        const filePath = path.join(tempDir, `factura_${timestamp}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        
        doc.pipe(writeStream);

        // Contenido del PDF
        doc.fontSize(20).text('FACTURA FISCAL', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12);
        doc.text(`Folio: ${factura.folio}`, { align: 'right' });
        doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-MX')}`, { align: 'right' });
        doc.moveDown();

        doc.text('DATOS DEL CLIENTE:', { underline: true });
        doc.text(`Razón Social: ${legal_name}`);
        doc.text(`RFC: ${rfc}`);
        doc.text(`Email: ${email}`);
        doc.moveDown();
        
        doc.text('PRODUCTOS/SERVICIOS:', { underline: true });
        doc.moveDown();
        
        // Tabla de productos
        let yPosition = doc.y;
        doc.text('Descripción', 50, yPosition);
        doc.text('Precio', 300, yPosition);
        doc.text('Cant.', 380, yPosition);
        doc.text('Subtotal', 450, yPosition);
        
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(520, yPosition).stroke();
        yPosition += 10;

        // CORREGIDO: Usar productos originales en lugar de factura.productos
        productosParaServicio.forEach((p) => {
          const subtotalProducto = p.precio * p.cantidad;
          doc.text(p.descripcion, 50, yPosition);
          doc.text(`$${p.precio.toFixed(2)}`, 300, yPosition);
          doc.text(p.cantidad.toString(), 380, yPosition);
          doc.text(`$${subtotalProducto.toFixed(2)}`, 450, yPosition);
          yPosition += 20;
        });

        yPosition += 10;
        doc.moveTo(50, yPosition).lineTo(520, yPosition).stroke();
        yPosition += 20;

        // Total
        doc.fontSize(14).text(`TOTAL: $${factura.total.toFixed(2)}`, 400, yPosition);
        doc.end();

        // Esperar a que se complete la escritura del PDF
        await new Promise((resolve, reject) => {
          writeStream.on('finish', () => {
            console.log('PDF local generado exitosamente');
            resolve();
          });
          writeStream.on('error', (error) => {
            console.error('Error al generar PDF local:', error);
            reject(error);
          });
        });

        // Generar resumen con OpenAI (opcional)
        let resumen = null;
        try {
          resumen = await generarResumenCompra({ 
            nombre: legal_name, 
            productos: productos, 
            total: factura.total 
          });
          console.log('Resumen generado:', resumen);
        } catch (aiError) {
          console.warn('No se pudo generar resumen con AI:', aiError.message);
          resumen = `Factura ${factura.folio} generada para ${legal_name}. Total: $${factura.total.toFixed(2)} MXN`;
        }

        const folio = factura.id || 'N/A';
        const fecha = new Date().toLocaleDateString('es-MX');

        const mensajeWhatsApp = `📄 ¡Hola ${legal_name}! Tu factura por $${total.toFixed(2)} MXN con folio ${folio} fue generada el ${fecha}. Gracias por tu preferencia.`;
        const mensajeSMS = `📢 ${legal_name}, tu factura de $${total.toFixed(2)} fue emitida con folio ${folio}.`;

        await enviarWhatsApp({ to: numero, body: mensajeWhatsApp });
       await enviarSMS({ to: numero, body: mensajeSMS });

        return {
          id: factura._id.toString(),
          cliente: { 
            nombre: legal_name, 
            rfc, 
            email 
          },
          productos: productos.map(p => ({
            nombre: p.nombre,
            precio: p.precio,
            cantidad: p.cantidad,
            subtotal: p.precio * p.cantidad
          })),
          total: factura.total,
          pdfUrl: factura.pdf_url, // URL oficial de Facturapi
          xmlUrl: factura.xml_url, // URL oficial del XML
          folio: factura.folio,
          resumen
        };

      } catch (error) {
        console.error('🛑 Error al emitir factura:', error.response?.data || error.message || error);
        throw new Error('No se pudo emitir la factura');
      }
    }
  }
};

module.exports = facturaResolvers;
