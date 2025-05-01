// frontend/src/App.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import PainelAtendente from './PainelAtendente';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api/chat';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [modoAtendente, setModoAtendente] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem('chatSessionId');
    if (storedSession) {
      setSessionId(storedSession);
      fetchMessagesFromSession(storedSession);
    } else {
      createSession();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionId) {
        fetchMessagesFromSession(sessionId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

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
        sender: 'Usuário: ',
        senderName: 'Você: ',
        text
      });
      setText('');
      fetchMessagesFromSession(sessionId);
    }
  };

  if (modoAtendente) return <PainelAtendente onVoltar={() => setModoAtendente(false)} />;

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg flex flex-col">
        <header className="bg-[#0669F7] text-white text-xl font-semibold p-4 rounded-t-xl shadow-md flex justify-between items-center">
          <span>Chat Online</span>
          <button onClick={() => setModoAtendente(true)} className="text-sm bg-white text-[#0669F7] px-3 py-1 rounded font-medium shadow">
            Painel do Atendente
          </button>
        </header>

        <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-[#f9fbfc]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[75%] px-4 py-2 text-sm rounded-lg shadow-sm whitespace-pre-wrap
                ${msg.sender === 'Usuário: '
                  ? 'ml-auto bg-[#0669F7] text-white'
                  : 'mr-auto bg-[#e9f1ff] text-[#1e1e1e]'}
              `}
            >
              {msg.senderName && (
                <span className="text-xs font-semibold mb-1 text-gray-500">
                  {msg.senderName}
                </span>
              )}
              <span>{msg.text}</span>
            </div>
          ))}
        </div>

        <div className="flex border-t border-gray-200">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border border-[#207CFF] rounded-l-lg p-2 outline-none"
            placeholder="Digite sua mensagem..."
          />
          <button
            onClick={sendMessage}
            className="bg-[#0669F7] hover:bg-[#1469E3] text-white px-4 rounded-r-lg"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
