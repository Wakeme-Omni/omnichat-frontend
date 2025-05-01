// frontend/src/App.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api/chat';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSessionClosed, setIsSessionClosed] = useState(false);

  useEffect(() => {
    const createSession = async () => {
      const response = await axios.post(API_URL);
      setSessionId(response.data.sessionId);
    };
    createSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionId) fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchMessages = async () => {
    const response = await axios.get(`${API_URL}/${sessionId}/messages`);
    setMessages(response.data);

    const encerrada = response.data.some(msg =>
      msg.text.toLowerCase().includes('esta conversa foi encerrada')
    );
    setIsSessionClosed(encerrada);
  };

  const sendMessage = async () => {
    if (text.trim() && !isSessionClosed) {
      await axios.post(`${API_URL}/${sessionId}/message`, {
        sender: 'Usuário: ',
        senderName: 'Você: ',
        text
      });
      setText('');
      fetchMessages();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-[#0669F7] mb-4">Chat Online</h1>
      <div className="w-full max-w-md border border-[#207CFF] rounded-lg p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-lg ${msg.sender === 'Usuário: ' ? 'bg-[#0669F7] text-white self-end' : 'bg-gray-200 self-start'}`}
            >
              <p className="text-sm font-semibold text-gray-700">{msg.senderName}</p>
              <p className="text-sm">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSessionClosed}
            className="flex-1 border border-[#207CFF] rounded-l-lg p-2 outline-none"
            placeholder={isSessionClosed ? 'Conversa encerrada. Inicie um novo atendimento.' : 'Digite sua mensagem...'}
          />
          <button
            onClick={sendMessage}
            disabled={isSessionClosed}
            className="bg-[#0669F7] hover:bg-[#1469E3] text-white px-4 rounded-r-lg"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
