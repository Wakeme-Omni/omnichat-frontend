// frontend/src/PainelAtendente.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function PainelAtendente({ onVoltar }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [atendente, setAtendente] = useState(localStorage.getItem('atendenteNome') || 'Ana');
  const [totalMessagesPorSessao, setTotalMessagesPorSessao] = useState({});
  const [visualizadasPorSessao, setVisualizadasPorSessao] = useState({});

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      refreshSessions();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    const response = await axios.get(`${API_URL}/sessions`);
    setSessions(response.data);
    const totals = {};
    response.data.forEach(s => {
      totals[s.sessionId] = s.totalMessages;
    });
    setTotalMessagesPorSessao(totals);
  };

  const refreshSessions = async () => {
    const response = await axios.get(`${API_URL}/sessions`);
    setSessions(response.data);
    const totals = {};
    response.data.forEach(s => {
      totals[s.sessionId] = s.totalMessages;
    });
    setTotalMessagesPorSessao(totals);
  };

  const loadMessages = async (sessionId) => {
    const response = await axios.get(`${API_URL}/chat/${sessionId}/messages`);
    setMessages(response.data);
    setSelectedSession(sessionId);
    setVisualizadasPorSessao((prev) => ({
      ...prev,
      [sessionId]: totalMessagesPorSessao[sessionId] || response.data.length || 0
    }));
  };

  const sendMessage = async () => {
    if (text.trim() && selectedSession) {
      await axios.post(`${API_URL}/chat/${selectedSession}/message`, {
        sender: 'Atendente: ',
        senderName: `${atendente}: `,
        text
      });
      setText('');
      const updated = await axios.get(`${API_URL}/chat/${selectedSession}/messages`);
      setMessages(updated.data);
      setVisualizadasPorSessao((prev) => ({
        ...prev,
        [selectedSession]: updated.data.length
      }));
    }
  };

  const handleChangeAtendente = (e) => {
    setAtendente(e.target.value);
    localStorage.setItem('atendenteNome', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg grid grid-cols-3">
        <aside className="col-span-1 border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Sessões</h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Nome do atendente</label>
            <input
              type="text"
              value={atendente}
              onChange={handleChangeAtendente}
              className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
              placeholder="Digite seu nome..."
            />
          </div>
          {sessions.map((session) => {
            const total = totalMessagesPorSessao[session.sessionId] || 0;
            const visualizadas = visualizadasPorSessao[session.sessionId] || 0;
            const hasNew = total > visualizadas && selectedSession !== session.sessionId;
            return (
              <button
                key={session.sessionId}
                onClick={() => loadMessages(session.sessionId)}
                className={`block w-full text-left mb-2 px-3 py-2 rounded-lg text-sm border ${selectedSession === session.sessionId ? 'bg-[#0669F7] text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                Sessão {session.sessionId.slice(0, 8)}...{' '}
                {hasNew && <span className="text-red-500">🔴</span>}<br />
                <span className="text-xs text-gray-500">{session.lastMessage}</span>
              </button>
            );
          })}
          <button onClick={onVoltar} className="mt-6 text-sm text-[#0669F7] underline">
            ← Voltar ao chat
          </button>
        </aside>

        <main className="col-span-2 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Mensagens</h2>

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
