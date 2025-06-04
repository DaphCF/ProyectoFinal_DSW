const { enviarSMS, enviarWhatsApp } = require('../services/notificacionService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const emitirFacturaHandler = async ({ nombre, email, numero, productos }) => {
  // ⚠️ Aquí ya no se crea cliente ni factura. Eso ahora lo hace el resolver.
  
  // Notificación opcional por WhatsApp
  // await enviarWhatsApp({ to: numero, body: `¡Hola ${nombre}! Tu factura fue enviada a ${email}.` });

  // Notificación opcional por SMS
  // await enviarSMS({ to: numero, body: `Hola ${nombre}, revisa tu correo: hemos enviado tu factura.` });

  // Si deseas generar un PDF de resumen aquí, lo puedes conservar:
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `../temp/resumen_${Date.now()}.pdf`);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(18).text('Resumen de compra', { align: 'center' });
  doc.moveDown();
  doc.text(`Nombre: ${nombre}`);
  doc.text(`Email: ${email}`);
  doc.moveDown();

  productos.forEach((p, i) => {
    doc.text(`${i + 1}. ${p.nombre} - $${p.precio} x ${p.cantidad}`);
  });

  const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  doc.moveDown();
  doc.text(`Total: $${total.toFixed(2)}`, { align: 'right' });
  doc.end();

  await new Promise((res, rej) => {
    writeStream.on('finish', res);
    writeStream.on('error', rej);
  });

  console.log('PDF de resumen generado en:', filePath);
};

module.exports = { emitirFacturaHandler };
