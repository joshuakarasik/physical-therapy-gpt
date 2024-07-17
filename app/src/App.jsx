import { useState } from "react";
import "./index.css"; // Ensure Tailwind CSS is imported

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
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = (message) => {
    if (!message.trim()) return;

    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setInputMessage(""); // Clear the input field
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
      content:
        "Speak like you are a Doctor of Physical Therapy and are great at helping patients. You ask questions to understand the patient's issues, and then once you have gathered enough information, you give suggestions on exercise and plans to help the patient get better. You let the patient know that you are only giving advice and cannot fully help without a doctor present.",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

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
    <div className="App h-screen w-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
      <header className="text-2xl text-blue-700 font-bold text-center py-4 bg-white shadow-md">
        Welcome to Physical Therapy
      </header>
      <div className="chat-container flex flex-col flex-grow">
        <div className="message-list flex-grow p-4 overflow-y-auto bg-gray-50">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`message mb-4 p-4 rounded max-w-3/4 ${
                message.direction === "incoming"
                  ? "bg-blue-100 text-gray-800 self-start"
                  : "bg-blue-300 text-gray-800 self-end"
              }`}
            >
              <span className="font-bold">{message.sender}:</span> {message.message}
            </div>
          ))}
          {typing && <div className="typing-indicator italic text-gray-500">ChatGPT is typing...</div>}
        </div>
        <div className="message-input flex p-4 bg-white shadow-md">
          <input
            type="text"
            value={inputMessage}
            placeholder="Type message here"
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend(inputMessage);
            }}
            className="flex-grow p-2 border border-gray-300 rounded bg-gray-50 text-gray-800"
          />
          <button
            onClick={() => handleSend(inputMessage)}
            className="ml-2 p-2 bg-blue-700 text-white rounded hover:bg-blue-900"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
