// frontend/src/App.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api/chat';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const storedSession = localStorage.getItem('chatSessionId');
    if (storedSession) {
      setSessionId(storedSession);
      fetchMessagesFromSession(storedSession);
    } else {
      createSession();
    }
  }, []);

  const createSession = async () => {
    const response = await axios.post(API_URL);
    const newSessionId = response.data.sessionId;
    setSessionId(newSessionId);
    localStorage.setItem('chatSessionId', newSessionId);
    fetchMessagesFromSession(newSessionId);
  };

  const fetchMessagesFromSession = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/messages`);
    setMessages(response.data);
  };

  const sendMessage = async () => {
    if (text.trim() && sessionId) {
      await axios.post(`${API_URL}/${sessionId}/message`, {
        sender: 'Usuário',
        text
      });
      setText('');
      fetchMessagesFromSession(sessionId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#e0e6ed] rounded-2xl shadow-md overflow-hidden">
        <div className="bg-[#0669F7] px-4 py-3 text-white text-lg font-semibold rounded-t-2xl">
          Chat Online
        </div>
        <div className="h-[400px] overflow-y-auto px-4 py-3 flex flex-col space-y-2 bg-[#f9fbfd]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap shadow-sm
                ${msg.sender === 'Usuário'
                  ? 'ml-auto bg-[#0669F7] text-white'
                  : 'mr-auto bg-white border border-[#dce3ec] text-[#333]'}
              `}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex border-t border-[#e0e6ed]">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2 text-sm outline-none rounded-bl-2xl"
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={sendMessage}
            className="bg-[#0669F7] hover:bg-[#207CFF] text-white text-sm font-medium px-4 py-2 rounded-br-2xl"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
