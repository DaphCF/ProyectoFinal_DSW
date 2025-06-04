const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_PASS);

async function enviarFacturaPorCorreo({ to, pdfPath }) {
  const msg = {
    to,
    from: 'windoesevolution12@gmail.com', //correo verificado
    subject: 'Tu factura',
    text: 'Adjuntamos tu factura en PDF. ¡Gracias por tu compra!',
    attachments: [
      {
        content: require('fs').readFileSync(pdfPath).toString('base64'),
        filename: 'Factura.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };
  await sgMail.send(msg);
}

module.exports = { enviarFacturaPorCorreo };
