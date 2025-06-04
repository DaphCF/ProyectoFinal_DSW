require("dotenv").config();
const { OpenAI } = require("openai");


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generarResumenCompra = async ({ nombre, productos, total }) => {
    console.log("🔐 Clave OpenAI leída:", process.env.OPENAI_API_KEY);

  const descripcion = productos.map(p => `${p.cantidad} x ${p.nombre} ($${p.precio})`).join(', ');

  const prompt = `Redacta un mensaje corto y amigable de agradecimiento por una compra para un cliente llamado ${nombre}, que compró: ${descripcion}. El total fue de $${total}.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generando resumen con OpenAI:", error.message);
    return "Gracias por tu compra. Te enviamos los detalles por correo.";
  }
};

module.exports = { generarResumenCompra };