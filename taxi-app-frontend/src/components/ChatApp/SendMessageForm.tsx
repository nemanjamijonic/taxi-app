import React, { useState, FormEvent } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

interface SendMessageFormProps {
  sendMessage: (msg: string) => void;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({ sendMessage }) => {
  const [msg, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(msg);
    setMessage("");
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{
        borderRadius: "10px",
        padding: "10px",
        backgroundColor: "#3f4b54",
      }}
    >
      <InputGroup className="mb-3">
        <Form.Control
          onChange={(e) => setMessage(e.target.value)}
          value={msg}
          placeholder="Enter a message"
        />
        <Button
          style={{ color: "white", backgroundColor: "#40a8ff" }}
          type="submit"
          disabled={!msg}
        >
          Send message
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SendMessageForm;
