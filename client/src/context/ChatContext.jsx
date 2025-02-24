import { createContext, useState, useCallback, useEffect } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [chats, setChats] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState(null);

  //list user we dont already have a chat with them
  const [potentialChats, setPotentialChats] = useState([]);

  const [currentChat, setCurrentChat] = useState(null);

  const [messages, setMessages] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);

  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setChatsLoading(true);
        setChatsError(null);

        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

        setChatsLoading(false);

        if (response.error) {
          return setChatsError(response);
        }
        setChats(response);
      }
    };
    getUserChats();
  }, [user, notifications]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);
      if (response.error)
        return console.log("Error fetching users : ", response);

      const pChats = await response?.filter((u) => {
        //filter current user from users
        if (user?._id === u?._id) return false;

        //filter if chat is already create with the user from "chats" in state
        let isChatCreated = false;
        if (chats) {
          isChatCreated = chats?.some((chat) => {
            return chat.members[0] === u?._id || chat.members[1] === u?._id;
          });
        }
        return !isChatCreated;
      });
      setPotentialChats(pChats);
      //set all users to use in notifications
      setAllUsers(response);
    };
    getUsers();
  }, [chats]);

  useEffect(() => {
    const getMessages = async () => {
      if (currentChat?._id) {
        setMessagesLoading(true);
        setMessagesError(null);

        const response = await getRequest(
          `${baseUrl}/messages/${currentChat?._id}`
        );

        setMessagesLoading(false);

        if (response.error) {
          return setMessagesError(response);
        }
        setMessages(response);
      }
    };
    getMessages();
  }, [currentChat]);

  //update socket
  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);
    setSocket(newSocket);
    //clean  up function
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  //add online users
  useEffect(() => {
    if (socket === null) return;
    //trigger an event to server
    socket.emit("newUserConnected", user?._id);
    //accept an event from server
    socket.on("getOnlineUsers", (response) => {
      setOnlineUsers(response);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  //send new message
  useEffect(() => {
    if (socket === null) return;

    const recepientId = currentChat?.members.find((id) => id !== user._id);
    socket.emit("sendNewMessage", { ...newMessage, recepientId });
  }, [newMessage]);

  //recieve new message (and notification)
  useEffect(() => {
    if (socket === null) return;

    // message
    socket.on("getNewMessage", (response) => {
      if (currentChat?._id === response?.chatId) {
        setMessages((prev) => [...prev, response]);
      }
    });

    // notification
    socket.on("getNotification", (response) => {
      const isChatOpen = currentChat?.members.some(
        (id) => id === response.senderId
      );

      if (isChatOpen) {
        setNotifications((prev) => [{ ...response, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [response, ...prev]);
      }
    });
    return () => {
      socket.off("getNewMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats/`,
      JSON.stringify({ firstId, secondId })
    );

    if (response.error) {
      return console.log("Error creating chat : ", response);
    }

    setChats((prev) => [...prev, response]);
  }, []);

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
  }, []);

  const sendTextMessage = useCallback(
    async (textMessage, senderId, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("you must be typing...");

      const response = await postRequest(
        `${baseUrl}/messages/`,
        JSON.stringify({
          text: textMessage,
          senderId: senderId,
          chatId: currentChatId,
        })
      );

      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMessage("");
    }
    //[]
  );

  const markAllNotificationsAsRead = useCallback((notifications) => {
    const modifiedNotifications = notifications.map((n) => ({
      ...n,
      isRead: true,
    }));
    setNotifications(modifiedNotifications);
  }, []);

  const markNotificationAsRead = useCallback(
    (notification, chats, user, notifications) => {
      //find chat to open
      const desiredChat = chats?.find((chat) => {
        // get members of the chat for finding a chat to fullfil both members
        const chatMembers = [user._id, notification.senderId];

        // now check every chat's members matching with chatMembers
        const isDesiredChat = chat?.members.every((member) =>
          chatMembers.includes(member)
        ); //check for every member to be true so isDesiredChat will be true
        return isDesiredChat;
      });

      // finally, chat to display or open
      updateCurrentChat(desiredChat);

      // now mark notification as read
      const modifiedNotifications = notifications.map((n) => {
        if (n.senderId === notification.senderId) {
          return { ...n, isRead: true };
        } else return n;
      });
      setNotifications(modifiedNotifications);
    },
    []
  );

  const markThisUserNotificationsAsRead = useCallback(
    (thisUserNotification, notifications) => {
      //mark specific Notifications as read (if you have 2 or more different chats notifications  )
      const modifiedNotifications = notifications.map((notification) => {
        let mNotification;

        thisUserNotification.forEach((n) => {
          if (n.senderId === notification.senderId) {
            mNotification = { ...n, isRead: true };
          } else {
            mNotification = notification;
          }
        });
        return mNotification;
      });
      setNotifications(modifiedNotifications);
    },
    []
  );
  return (
    <ChatContext.Provider
      value={{
        chats,
        chatsLoading,
        chatsError,
        potentialChats,
        createChat,
        updateCurrentChat,
        messages,
        messagesLoading,
        messagesError,
        currentChat,
        sendTextMessage,
        onlineUsers,
        allUsers,
        notifications,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead,
        newMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
