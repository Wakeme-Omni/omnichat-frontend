// frontend/src/PainelAtendente.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function PainelAtendente({ onVoltar }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      if (selectedSession) {
        refreshMessages(selectedSession);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  const fetchSessions = async () => {
    const response = await axios.get(`${API_URL}/sessions`);
    setSessions(response.data);
  };

  const loadMessages = async (sessionId) => {
    const response = await axios.get(`${API_URL}/chat/${sessionId}/messages`);
    setMessages(response.data);
    setSelectedSession(sessionId);
    setNewMessageAlert(false);
  };

  const refreshMessages = async (sessionId) => {
    const response = await axios.get(`${API_URL}/chat/${sessionId}/messages`);
    if (response.data.length > messages.length) {
      setMessages(response.data);
      setNewMessageAlert(true);
    }
  };

  const sendMessage = async () => {
    if (text.trim() && selectedSession) {
      await axios.post(`${API_URL}/chat/${selectedSession}/message`, {
        sender: 'Atendente: ',
        senderName: 'Ana: ',
        text
      });
      setText('');
      loadMessages(selectedSession);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg grid grid-cols-3">
        <aside className="col-span-1 border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Sessões</h2>
          {sessions.map((session) => (
            <button
              key={session.sessionId}
              onClick={() => loadMessages(session.sessionId)}
              className={`block w-full text-left mb-2 px-3 py-2 rounded-lg text-sm border ${selectedSession === session.sessionId ? 'bg-[#0669F7] text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Sessão {session.sessionId.slice(0, 8)}...<br />
              <span className="text-xs text-gray-500">{session.lastMessage}</span>
            </button>
          ))}
          <button onClick={onVoltar} className="mt-6 text-sm text-[#0669F7] underline">
            ← Voltar ao chat
          </button>
        </aside>

        <main className="col-span-2 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Mensagens</h2>
          {newMessageAlert && <div className="text-sm text-red-600 mb-2">📩 Nova mensagem recebida</div>}

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-[#f9fbfc] p-3 rounded-lg border border-gray-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] px-4 py-2 text-sm rounded-lg shadow-sm whitespace-pre-wrap
                  ${msg.sender === 'Usuário: '
                    ? 'ml-auto bg-[#0669F7] text-white'
                    : 'mr-auto bg-[#e9f1ff] text-[#1e1e1e]'}
                `}
              >
                {msg.senderName && (
                  <span className="text-xs font-semibold mb-1 block text-gray-500">
                    {msg.senderName}
                  </span>
                )}
                {msg.text}
              </div>
            ))}
          </div>

          {selectedSession && (
            <div className="flex border-t border-gray-200 pt-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-4 py-2 text-sm outline-none border border-gray-300 rounded-l-md"
                placeholder="Mensagem do atendente..."
              />
              <button
                onClick={sendMessage}
                className="bg-[#0669F7] hover:bg-[#207CFF] text-white text-sm font-medium px-6 py-2 rounded-r-md"
              >
                Enviar
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
