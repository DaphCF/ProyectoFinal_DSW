const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const FACTURAPI_KEY = process.env.FACTURAPI_KEY;
const API_BASE = 'https://www.facturapi.io/v2';

const { generarResumenCompra } = require('./openAiservice'); // importar
const { enviarFacturaPorCorreo } = require('./services/emailService');
const { enviarSMS, enviarWhatsApp } = require('./services/notificacionService');

const emitirFacturaHandler = async ({ nombre, rfc, email, productos }) => {
  try {
    // Paso 1: Crear o usar cliente
    const cliente = await axios.post(`${API_BASE}/customers`, {
  legal_name: nombre,
  tax_id: rfc,
  email,
  address: {
    zip: "01000",        // Requerido
    street: "Calle Falsa",
    exterior: "123",
    neighborhood: "Centro",
    city: "CDMX",
    state: "Ciudad de México",
    country: "MEX"
  }
}, {
  headers: { Authorization: `Bearer ${FACTURAPI_KEY}` }
});


    // Paso 2: Formatear productos para FacturAPI
    const conceptos = productos.map(p => ({
      quantity: p.cantidad,
      product: {
        description: p.nombre,
        product_key: "01010101",  // genérico
        price: p.precio
      }
    }));

    // Paso 3: Crear factura
    const factura = await axios.post(`${API_BASE}/invoices`, {
      customer: cliente.data.id,
      items: conceptos,
      payment_form: "01", // efectivo
      use: "G03",         // gastos generales
      type: "I",          // ingreso
    }, {
      headers: { Authorization: `Bearer ${FACTURAPI_KEY}` }
    });

    const pdfUrl = factura.data.pdf_url;

    // Paso 4: Generar PDF personalizado
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `factura_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Factura Generada', { align: 'center' });
    doc.moveDown();
    doc.text(`Cliente: ${nombre}`);
    doc.text(`RFC: ${rfc}`);
    doc.text(`Email: ${email}`);
    doc.moveDown();
    doc.text('Productos:');
    productos.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.nombre} - $${p.precio} x ${p.cantidad}`);
    });
    const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    const resumen = await generarResumenCompra({ nombre, productos, total });
    doc.moveDown();
    doc.text(`Total: $${total.toFixed(2)}`, { align: 'right' });

    doc.end();

    // Espera a que el PDF termine de guardarse antes de enviar el correo
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Ahora sí, el PDF está listo y puedes enviarlo
    await enviarFacturaPorCorreo({ to: email, pdfPath: filePath });

    // Notificar por SMS (si tienes el número)
    // await enviarSMS({ to: '+521XXXXXXXXXX', body: `¡Hola ${nombre}! Tu factura ha sido enviada a tu correo.` });

    // Notificar por WhatsApp (si tienes el número)
    // await enviarWhatsApp({ to: '+521XXXXXXXXXX', body: `¡Hola ${nombre}! Tu factura ha sido enviada a tu correo.` });

    return {
      id: factura.data.id,
      cliente: { nombre, rfc, email },
      productos,
      total,
      pdfUrl,
      resumen
    };

  } catch (error) {
    console.error('Error al emitir factura:', error.response?.data || error.message);
    throw new Error('Error al emitir factura');
  }
};

module.exports = {
  emitirFacturaHandler
};
