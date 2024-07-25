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
        <Table striped bordered key={index} style={{ marginBottom: "10px" }}>
          <tbody>
            <tr>
              <td>
                <p
                  style={{
                    border: "2px solid #ddd",
                    borderRadius: "10px",
                    padding: "10px",
                    backgroundColor: "#f9f9f9",
                    marginBottom: "-10px",
                  }}
                >
                  <strong style={{ color: "#40a8ff" }}>{msg.username}:</strong>{" "}
                  <span style={{ color: "#6c7e8c" }}>{msg.msg}</span>
                  <span
                    style={{
                      display: "block",
                      textAlign: "right",
                      marginTop: "5px",
                      fontSize: "0.9em",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    Sent at: {new Date().toLocaleTimeString()}
                  </span>
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
