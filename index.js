const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productTypeDefs = require('./schemas/productSchema');
const userTypeDefs = require('./schemas/userSchema');
const facturaTypeDefs = require('./schemas/facturaSchema');

const facturaResolvers = require('./controllers/facturaController');
const userResolver = require('./controllers/userController')

const resolvers = [userResolver, facturaResolvers];

const typeDefs = [productTypeDefs, userTypeDefs, facturaTypeDefs];

const startServer = async () => {
  const app = express();

  // Conectar a MongoDB (omitido temporalmente)
  
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
