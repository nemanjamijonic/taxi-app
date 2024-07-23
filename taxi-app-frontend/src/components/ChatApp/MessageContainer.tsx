import React from "react";
import { Table } from "react-bootstrap";

interface Message {
  username: string;
  msg: string;
}

interface MessageContainerProps {
  messages: Message[];
}

const MessageContainer: React.FC<MessageContainerProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <Table striped bordered key={index}>
          <tbody>
            <tr>
              <td>
                <p
                  style={{
                    color: "red",
                  }}
                >
                  <strong style={{ color: "blue" }}>{msg.username}:</strong>{" "}
                  {msg.msg}
                  <hr></hr>
                </p>
              </td>
            </tr>
          </tbody>
        </Table>
      ))}
    </div>
  );
};

export default MessageContainer;
