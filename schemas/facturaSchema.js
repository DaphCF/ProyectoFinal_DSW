const { gql } = require('apollo-server-express');

const facturaTypeDefs = gql`
  type Cliente {
    id: ID
    legal_name: String
    email: String
    tax_id: String
    address: Direccion
  }

  type Direccion {
    zip: String
    street: String
    exterior: String
    neighborhood: String
    city: String
    state: String
    country: String
  }

  input DireccionInput {
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
    address: DireccionInput!
  }

  input ActualizarClienteInput {
    legal_name: String
    email: String
    tax_id: String
    address: DireccionInput
  }

  type Producto {
    id: ID
    description: String
    product_key: String
    price: Float
  }

  input CrearProductoInput {
    description: String!
    product_key: String!
    price: Float!
  }

  input ActualizarProductoInput {
    description: String
    product_key: String
    price: Float
  }

  input ProductoFacturaInput {
    nombre: String!
    precio: Float!
    cantidad: Int!
  }

  input EmitirFacturaInput {
    legal_name: String!
    rfc: String!
    email: String!
    productos: [ProductoFacturaInput!]!
  }

  input CrearProductoInput {
  description: String!
  product_key: String!
  price: Float!
  }

  type ProductoFactura {
    nombre: String!
    precio: Float!
    cantidad: Int!
  }

  type FacturaEmitida {
    id: ID
    cliente: ClienteInfo
    productos: [ProductoFactura]
    total: Float
    pdfUrl: String
    resumen: String
  }

  type ClienteInfo {
    nombre: String
    rfc: String
    email: String
  }

  type Query {
    obtenerClientes: [Cliente]
    obtenerCliente(id: ID!): Cliente
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto
  }

  type Producto {
  id: ID
  description: String
  product_key: String
  price: Float
  }

  type Mutation {
    crearCliente(input: CrearClienteInput!): Cliente
    actualizarCliente(id: ID!, input: ActualizarClienteInput!): Cliente
    eliminarCliente(id: ID!): Boolean

    crearProducto(input: CrearProductoInput!): Producto
    actualizarProducto(id: ID!, input: ActualizarProductoInput!): Producto
    eliminarProducto(id: ID!): Boolean

    emitirFactura(input: EmitirFacturaInput!): FacturaEmitida
  }

  extend type Mutation {
  actualizarCliente(id: ID!, input: CrearClienteInput!): Cliente
  eliminarCliente(id: ID!): Boolean

  crearProducto(input: CrearProductoInput!): Producto
  actualizarProducto(id: ID!, input: CrearProductoInput!): Producto
  eliminarProducto(id: ID!): Boolean
}
`;

module.exports = facturaTypeDefs;
