const messages = [];
const CHAT_CHANNEL = "CHAT_CHANNEL";

const resolvers = {
  Query: {
    allMessages(root, args, context) {
      return messages;
    },
  },

  Mutation: {
    sendMessage(root, { author, text }, { pubsub }) {
      const message = { id: messages.length + 1, author, text };

      messages.push(message);
      pubsub.publish("CHAT_CHANNEL", { messageSent: message });

      return message;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (root, args, { pubsub }) => {
        return pubsub.asyncIterator(CHAT_CHANNEL);
      },
    },
  },
};

module.exports = resolvers;
