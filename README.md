# Graphql subscriptions practice (Chat app)

## This project consists of two main components server (node + graphql-yoga) and web-client(React + apollo-client)

Create a project folder (for example `chat_app`), in this folder we will create server and web-client subfolders.

### Creating GraphQL Server

Create server folder
`$ mkdir server`

Next, cd into server and run the command below:

```
$ cd server
$ npm init -y
```

Now, let’s install graphql-yoga:

`$ npm install graphql-yoga`

Once that’s done installing, we’ll create a src directory inside the server directory:
`mkdir src`

So let’s create an index.js file inside the src directory and paste the code below in it:

```
const { GraphQLServer, PubSub } = require('graphql-yoga')
    const typeDefs = require('./schema')
    const resolvers = require('./resolver')

    const pubsub = new PubSub()
    const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })

    server.start(() => console.log('Server is running on localhost:4000'))
```

Inside the src directory, create a schema.js file and paste the code below in it:

```
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
        sendMessage(author: String!, text: String!): Chat
      }

      type Subscription {
        messageSent: Message
      }
    `
    module.exports = typeDefs
```

With the schemas defined, let’s move on to defining the resolver functions. Inside the src directory, create a resolver.js file and paste the code below in it:

```
    const messages = []
    const CHAT_CHANNEL = 'CHAT_CHANNEL'

    const resolvers = {
      Query: {
        allMessages (root, args, context) {
          return messages
        }
      },

      Mutation: {
        sendMessage (root, { author, text }, { pubsub }) {
          const message = { id: chats.length + 1, author, text }

          messages.push(message)
          pubsub.publish('CHAT_CHANNEL', { messageSent: message })

          return message
        }
      },

      Subscription: {
        messageSent: {
          subscribe: (root, args, { pubsub }) => {
            return pubsub.asyncIterator(CHAT_CHANNEL)
          }
        }
      }
    }

    module.exports = resolvers
```

Use node or nodemon to start the server
`node src/index.js`
