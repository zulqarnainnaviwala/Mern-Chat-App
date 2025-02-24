import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipientUser";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";
import Send from "../../assets/send.svg";

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const {
    messages,
    messagesLoading,
    messagesError,
    currentChat,
    sendTextMessage,
  } = useContext(ChatContext);
  const { recepientUser } = useFetchRecipientUser(currentChat, user);

  const [textMessage, setTextMessage] = useState("");

  const scroll = useRef();

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!recepientUser) {
    return (
      <p
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        No Chat Selected yet...
      </p>
    );
  }
  if (messagesLoading) {
    return (
      <p
        style={{
          textAlign: "center",
          width: "100%",
        }}
      >
        Loading Messages...
      </p>
    );
  }

  return (
    <Stack className="chat-box" gap={4}>
      <div className="chat-header">{recepientUser?.name}</div>
      <Stack gap={3} className="messages">
        {messages &&
          messages?.map((message, index) => (
            <Stack
              key={index}
              className={`${
                message?.senderId === user._id
                  ? "message self align-self-end flex-grow-0"
                  : "message align-self-start flex-grow-0"
              }`}
              ref={scroll}
            >
              <span>{message?.text}</span>
              <span className="meesage-footer">
                {moment(message?.createdAt).calendar()}
              </span>
            </Stack>
          ))}
      </Stack>
      <Stack direction="horizontal" gap={3} className="chat-input flow-grow-0">
        <InputEmoji
          value={textMessage}
          onChange={setTextMessage}
          className=""
          fontFamily="nunito"
          borderColor="rgba(72,112,223,0.2)"
        />
        <button
          className="send-btn"
          onClick={() =>
            sendTextMessage(
              textMessage,
              user._id,
              currentChat._id,
              setTextMessage
            )
          }
        >
          <img src={Send} alt="Send" />
        </button>
      </Stack>
    </Stack>
  );
};

export default ChatBox;
