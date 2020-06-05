import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const getAllChatsQuery = gql`
  {
    allMessages {
      id
      author
      text
    }
  }
`;

const subscription = gql`
  subscription MessageSentSubscription {
    messageSent {
      id
      author
      text
    }
  }
`;

const MessageItem = ({ message }) => (
  <li style={{ borderTop: "1px solid lightgray" }}>
    <p>
      {message.author || "Anonymous"}: {message.text}
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
        {data.allMessages.map((message) => (
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
              allMessages: [
                subscriptionData.data.messageSent,
                ...previousData.allMessages,
              ],
            };
          },
        });
      return <MessageListView data={data} subscribeToMore={more} />;
    }}
  </Query>
);

export default MessageList;
