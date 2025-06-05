require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log('🔍 TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('🔍 TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'CARGADO ✅' : 'NO CARGADO ❌');
console.log('📞 SMS From:', process.env.TWILIO_PHONE_NUMBER_SMS);
console.log('💬 WhatsApp From:', process.env.TWILIO_PHONE_NUMBER_WHATSAPP);

function esNumeroValido(numero) {
  const regex = /^\+\d{10,15}$/;
  return regex.test(numero);
}

async function enviarSMS({ to, body }) {
  if (!esNumeroValido(to)) {
    console.error(`❌ Número inválido para SMS: ${to}`);
    return;
  }

  console.log(`📲 Enviando SMS a: ${to}`);
  console.log(`📦 Mensaje: ${body}`);

  try {
    const res = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER_SMS,
      to
    });
    console.log(`✅ SMS enviado: SID = ${res.sid}`);
  } catch (error) {
    console.error(`❌ Error al enviar SMS a ${to}:`, error.message);
  }
}

async function enviarWhatsApp({ to, body }) {
  const limpio = to.startsWith('whatsapp:') ? to.replace('whatsapp:', '') : to;

  if (!esNumeroValido(limpio)) {
    console.error(`❌ Número inválido para WhatsApp: ${to}`);
    return;
  }

  const destinoFinal = `whatsapp:${limpio}`;
  console.log(`📲 Enviando WhatsApp a: ${destinoFinal}`);
  console.log(`📦 Mensaje: ${body}`);

  try {
    const res = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER_WHATSAPP,
      to: destinoFinal
    });
    console.log(`✅ WhatsApp enviado: SID = ${res.sid}`);
  } catch (error) {
    console.error(`❌ Error al enviar WhatsApp a ${destinoFinal}:`, error.message);
  }
}

async function enviarAmbosCanales({ to, mensajeWhatsApp, mensajeSMS }) {
  await enviarWhatsApp({ to, body: mensajeWhatsApp });
  await enviarSMS({ to, body: mensajeSMS });
}

module.exports = {
  enviarSMS,
  enviarWhatsApp,
  enviarAmbosCanales,
};
