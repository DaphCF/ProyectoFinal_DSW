const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function enviarSMS({ to, body }) {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

async function enviarWhatsApp({ to, body }) {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER, // debe ser formato whatsapp:+...
    to: `whatsapp:${to}`
  });
}

module.exports = { enviarSMS, enviarWhatsApp };
