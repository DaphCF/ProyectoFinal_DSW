// controllers/facturaController.js
const FacturaService = require('../services/facturaService');
const { generarResumenCompra } = require('../apis/openaiService');
const { enviarFacturaPorCorreo } = require('../services/emailService');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Instanciar el servicio
const facturaService = new FacturaService();

const facturaResolvers = {
  Mutation: {
    emitirFactura: async (_, { input }) => {
      try {
        console.log('Input recibido:', JSON.stringify(input, null, 2));
        
        const { legal_name, rfc, email, productos } = input;

        // Validaciones básicas
        if (!legal_name || !rfc || !email) {
          throw new Error('Faltan datos requeridos: legal_name, rfc o email');
        }

        if (!productos || productos.length === 0) {
          throw new Error('Debe incluir al menos un producto');
        }

        // Validar productos
        productos.forEach((producto, index) => {
          if (!producto.nombre || !producto.precio || !producto.cantidad) {
            throw new Error(`Producto ${index + 1}: faltan datos requeridos (nombre, precio, cantidad)`);
          }
          if (producto.precio <= 0 || producto.cantidad <= 0) {
            throw new Error(`Producto ${index + 1}: precio y cantidad deben ser mayores a 0`);
          }
        });

        console.log('Validaciones pasadas, creando factura...');

        // Preparar datos del cliente para el servicio
        const clienteInput = {
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
        };

        // Convertir productos al formato esperado por el servicio
        const productosParaServicio = productos.map(p => ({
          descripcion: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad,
          claveProducto: "01010101", // Clave genérica de producto
          claveUnica: ""
        }));

        // Crear factura usando el servicio
        let factura;
        try {
          factura = await facturaService.crearFactura({
            clienteInput,
            productos: productosParaServicio
          });
          console.log('Factura creada exitosamente:', factura);
        } catch (serviceError) {
          console.error('Error en facturaService.crearFactura:', serviceError);
          throw new Error(`Error al crear factura: ${serviceError.message}`);
        }

        // Crear directorio temp si no existe
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generar PDF local adicional (opcional, ya que Facturapi genera uno)
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

        // Enviar por correo (opcional)
        try {
          await enviarFacturaPorCorreo({ 
            to: email, 
            pdfPath: filePath,
            pdfUrl: factura.pdf_url, // URL del PDF de Facturapi
            xmlUrl: factura.xml_url, // URL del XML de Facturapi
            subject: `Factura ${factura.folio} - ${legal_name}`,
            body: `Estimado ${legal_name}, adjunto encontrará su factura fiscal.`
          });
          console.log('Correo enviado exitosamente');
        } catch (emailError) {
          console.warn('No se pudo enviar correo:', emailError.message);
        }

        // Retornar respuesta
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
        console.error('Error completo al emitir factura:', error);
        console.error('Stack trace:', error.stack);
        
        // Proporcionar información más específica del error
        if (error.message.includes('FACTURAPI_KEY')) {
          throw new Error('Error de configuración: Falta la clave de Facturapi');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          throw new Error('Error de conexión con el servicio de facturación');
        } else {
          throw new Error(`No se pudo emitir la factura: ${error.message}`);
        }
      }
    }
  }
};

module.exports = facturaResolvers;
