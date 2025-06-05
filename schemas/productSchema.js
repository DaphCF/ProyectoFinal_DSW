const { gql } = require('apollo-server');

const typeDefs = gql`
    type Producto {
        id: ID!
        name: String!
        description: String!
        price: Float!
        quantity: Int!
        product_key: String!
        unit_key: String!
        facturapiId: String!  
    }

    input ProductoInput {
        name: String!
        description: String!
        price: Float!
        quantity: Int!
        product_key: String!
        unit_key: String!
    }

    input ProductoFacturaInput {
        nombre: String!
        precio: Float!
        cantidad: Int!
    }

    type Factura {
        id: ID
        total: Float
        pdfUrl: String
        resumen: String
    }

    type Query {
        getProductos: [Producto!]!
        getProducto(id: ID!): Producto
    }

    type Mutation {
        createProducto(input: ProductoInput!): Producto!
        updateProducto(id: ID!, input: ProductoInput!): Producto!
        deleteProducto(id: ID!): Producto
    }
`;

module.exports = typeDefs;