import React from "react";
import { Table } from "react-bootstrap";

interface Message {
  username: string;
  msg: string;
  createdAt: string;
  userType: string;
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
                    backgroundColor:
                      msg.username === "admin"
                        ? "#fa5407" // red for admin messages
                        : msg.userType === "User"
                        ? "#5693f5" // blue for user messages
                        : "#07fa40", // green for driver messages
                    color: "#fff",
                    marginBottom: "-10px",
                  }}
                >
                  <strong>{msg.username}:</strong> <span>{msg.msg}</span>
                  <span
                    style={{
                      display: "block",
                      textAlign: "right",
                      marginTop: "5px",
                      fontSize: "0.9rem",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    <b style={{ color: "#080808" }}>
                      Sent at: {new Date(msg.createdAt).toLocaleTimeString()}
                    </b>
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
