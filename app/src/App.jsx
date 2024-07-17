import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "sk-None-7Usfe4OS0c7ePwQTP4AET3BlbkFJClrndZDo3oD64KwF4y87";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);

  const handleSend = (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setTyping(true);

    processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messagesObject) => {
      let role = "";
      if (messagesObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messagesObject.message };
    });

    const systemMessage = {
      role: "system",
      content: "Speak like you are a Doctor of Physical Therapy and are great at helping patients.",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();
      setMessages([
        ...chatMessages,
        {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming",
        },
      ]);
      setTyping(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setTyping(false);
    }
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => (
                <Message
                  key={i}
                  model={{
                    message: message.message,
                    sentTime: "just now",
                    sender: message.sender,
                    direction: message.direction,
                  }}
                />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Type message here"
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
