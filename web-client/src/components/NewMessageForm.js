import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";

const CREATE_MESSAGE = gql`
  mutation sendMessage($author: String!, $text: String!) {
    sendMessage(author: $author, text: $text) {
      id
    }
  }
`;

const NewMessageForm = () => (
  <Mutation mutation={CREATE_MESSAGE}>
    {(sendMessage) => {
      const onSubmit = (event) => {
        event.preventDefault();
        const text = event.target.text.value;
        if (!text) return;
        const author = event.target.author.value;
        sendMessage({ variables: { author, text } });
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
