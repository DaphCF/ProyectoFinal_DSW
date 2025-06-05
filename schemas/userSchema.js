const { gql } = require('apollo-server');

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

    type Query {
        getClientes: [Cliente!]!
        getCliente(id: ID!): Cliente
    }

    type Mutation {
        createCliente(input: ClienteInput!): Cliente!
        updateCliente(id: ID!, input: ClienteInput!): Cliente!
        deleteCliente(id: ID!): Cliente
    }
`;

module.exports = typeDefs;
