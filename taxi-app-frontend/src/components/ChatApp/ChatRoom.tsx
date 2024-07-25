import React from "react";
import { Row, Col } from "react-bootstrap";
import MessageContainer from "./MessageContainer";
import SendMessageForm from "./SendMessageForm";

interface Message {
  username: string;
  msg: string;
}

interface ChatRoomProps {
  messages: Message[];
  sendMessage: (msg: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ messages, sendMessage }) => (
  <div>
    <Row className="px-5 py-5">
      <Col sm={10}>
        <h1 style={{ color: "#6c7e8c" }}>Chat Room</h1>
      </Col>
    </Row>
    <Row className="px-5 py-5">
      <Col sm={12}>
        <MessageContainer messages={messages} />
      </Col>
      <br></br>
      <Col sm={12}>
        <SendMessageForm sendMessage={sendMessage} />
      </Col>
    </Row>
  </div>
);

export default ChatRoom;
