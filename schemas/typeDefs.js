const gql = require('graphql-tag');

const typeDefs = gql`
    type Cliente {
        id: ID!
        legal_name: String!
        rfc: String!
        email: String!
        address: Direccion!
    }

    type Direccion {
        zip: String
        street: String
        external: String
        internal: String
        neighborhood: String
        city: String
        municipality: String
        state: String
        country: String
    }

    type Producto {
        id: ID!
        descripcion: String!
        precio: Float!
        cantidad: Int!
        claveProducto: String!
        claveUnica: String!
    }

    input ClienteInput {
        legal_name: String!
        rfc: String!
        email: String!
        address: DireccionInput!
    }

    input DireccionInput {
        zip: String
        street: String
        external: String
        internal: String
        neighborhood: String
        city: String
        municipality: String
        state: String
        country: String
    }

    input ProductoInput {
        descripcion: String!
        precio: Float!
        cantidad: Int!
        claveProducto: String!
        claveUnica: String!
    }

    type Query {
        getClientes: [Cliente!]!
        getCliente(id: ID!): Cliente
        getProductos: [Producto!]!
        getProducto(id: ID!): Producto
    }

    type Mutation {
        createCliente(input: ClienteInput!): Cliente!
        updateCliente(id: ID!, input: ClienteInput!): Cliente!
        deleteCliente(id: ID!): Cliente

        createProducto(input: ProductoInput!): Producto!
        updateProducto(id: ID!, input: ProductoInput!): Producto!
        deleteProducto(id: ID!): Producto

        emitirFactura(
            clienteId: ID!
            productos: [ProductoInput!]!
        ): Factura
    }

    type Factura {
        id: ID!
        folio: String
        cliente: Cliente
        productos: [Producto]
        total: Float
        fecha: String
        pdf_url: String
        xml_url: String
    }
`;

module.exports = typeDefs;