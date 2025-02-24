import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chats/UserChat";
import PotentialChats from "../components/chats/PotentialChats";
import ChatBox from "../components/chats/ChatBox";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { chats, chatsLoading, chatsError, updateCurrentChat } =
    useContext(ChatContext);
  return (
    <Container>
      <PotentialChats />
      {chats?.length < 0 ? null : (
        <Stack direction="horizontal" gap={4} className="align-items-start">
          <Stack className="messages-box flex-grow-0 pe-3" gap={3}>
            {chatsLoading && <p>Loading Chats...</p>}
            {chats?.map((chat, index) => {
              return (
                <div key={index} onClick={() => updateCurrentChat(chat)}>
                  <UserChat chat={chat} user={user} />
                </div>
              );
            })}
          </Stack>
          <ChatBox />
        </Stack>
      )}
    </Container>
  );
};

export default Chat;
