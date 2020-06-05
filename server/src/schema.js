const typeDefs = `
      type Message {
        id: Int!
        author: String!
        text: String!
      }

      type Query {
        allMessages: [Message]
      }

      type Mutation {
        sendMessage(author: String!, text: String!): Message
      }

      type Subscription {
        messageSent: Message
      }
    `;
module.exports = typeDefs;
