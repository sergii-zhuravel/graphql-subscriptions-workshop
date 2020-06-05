# Graphql subscriptions practice (Chat app)

## This project consists of two main components: server (node + graphql-yoga) and web-client(React + apollo-client)

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

### Creating web client (React app)

Create web-client folder
`$ mkdir web-client`

Create react app
`npx create-react-app .`

Install dependencies:
`npm install graphql graphql-tag apollo-client apollo-link apollo-link-http apollo-link-ws apollo-utilities apollo-cache-inmemory react-apollo subscriptions-transport-ws`

App.js code

```
import React from "react";
import { ApolloClient } from "apollo-client";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";

import NewMessageForm from "./components/NewMessageForm";
import MessageList from "./components//MessageList";

const httpLink = new HttpLink({
  uri: "http://localhost:4000",
});
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000",
  options: {
    reconnect: true,
  },
});
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>Simple Chat</h1>
        <NewMessageForm />
        <MessageList />
      </div>
    </ApolloProvider>
  );
}
```

Form component uses mutation, Example code:

```
import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

const CREATE_MESSAGE = gql`
  mutation sendMessage($from: String!, $message: String!) {
    sendMessage(from: $from, message: $message) {
      id
    }
  }
`;

const NewMessageForm = () => (
  <Mutation mutation={CREATE_MESSAGE}>
    {(sendMessage) => {
      const onSubmit = (event) => {
        event.preventDefault();
        const message = event.target.text.value;
        if (!message) return;
        const from = event.target.author.value;
        sendMessage({ variables: { from, message } });
        event.target.text.value = "";
      };
      return (
        <form className="form-inline mb-2" onSubmit={onSubmit}>
          <input className="form-control" name="author" placeholder="Author" />
          :
          <input className="form-control" name="text" placeholder="Text" />
          <button type="submit" className="btn btn-primary ml-2">
            Send
          </button>
        </form>
      );
    }}
  </Mutation>
);

export default NewMessageForm;
```

MessagesList component uses query and subscription. Example:

```
import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const getAllChatsQuery = gql`
  {
    chats {
      id
      from
      message
    }
  }
`;

const subscription = gql`
  subscription MessageSentSubscription {
    messageSent {
      id
      from
      message
    }
  }
`;

const MessageItem = ({ message }) => (
  <li style={{ borderTop: "1px solid lightgray" }}>
    <p>
      {message.from || "Anonymous"}: {message.message}
    </p>
  </li>
);

const MessageListView = class extends React.PureComponent {
  componentDidMount() {
    this.props.subscribeToMore();
  }
  render() {
    const { data } = this.props;
    return (
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {data.chats.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </ul>
    );
  }
};

const MessageList = () => (
  <Query query={getAllChatsQuery}>
    {({ loading, error, data, subscribeToMore }) => {
      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error: {error.message}</p>;
      const more = () =>
        subscribeToMore({
          document: subscription,
          updateQuery: (previousData, { subscriptionData }) => {
            if (!subscriptionData.data) return previousData;
            return {
              chats: [subscriptionData.data.messageSent, ...previousData.chats],
            };
          },
        });
      return <MessageListView data={data} subscribeToMore={more} />;
    }}
  </Query>
);

export default MessageList;

```
