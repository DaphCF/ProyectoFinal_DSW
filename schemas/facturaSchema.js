const { gql } = require('apollo-server-express');

const facturaTypeDefs = gql`
  type Cliente {
    id: ID
    legal_name: String
    email: String
    tax_id: String
    address: Address
  }

  type Address {
    zip: String
    street: String
    exterior: String
    neighborhood: String
    city: String
    state: String
    country: String
  }

  input AddressInput {
    zip: String
    street: String
    exterior: String
    neighborhood: String
    city: String
    state: String
    country: String
  }

  input CrearClienteInput {
    legal_name: String!
    email: String!
    tax_id: String!
    address: AddressInput!
  }

  input ProductoFacturaInput {
    nombre: String!
    precio: Float!
    cantidad: Int!
  }

  input EmitirFacturaInput {
    nombre: String!
    rfc: String!
    email: String!
    productos: [ProductoFacturaInput!]!
  }

  type FacturaEmitida {
    id: ID
    cliente: ClienteInfo
    productos: [ProductoFacturaInput]
    total: Float
    pdfUrl: String
    resumen: String
  }

  type ClienteInfo {
    nombre: String
    rfc: String
    email: String
  }

  type Mutation {
    crearCliente(input: CrearClienteInput!): Cliente
    emitirFactura(input: EmitirFacturaInput!): FacturaEmitida
  }
`;

module.exports = facturaTypeDefs;
