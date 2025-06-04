const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const typeDefs = require('./schemas/typeDefs');
const resolvers = require('./controllers/userController')

const startServer = async () => {
  const app = express();

  // Conectar a MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
  }

  // Apollo Server
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use(express.json());

  // Middleware GraphQL en /graphql
  app.use('/graphql', expressMiddleware(server, { context: async ({ req }) => ({ req })}));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server corriendo en http://localhost:${PORT}/graphql`);
  });
};

startServer();
