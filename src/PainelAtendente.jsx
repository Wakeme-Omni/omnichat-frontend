// frontend/src/PainelAtendente.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function PainelAtendente({ onVoltar }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [atendente, setAtendente] = useState(localStorage.getItem('atendenteNome') || 'Ana');
  const [totalMessagesPorSessao, setTotalMessagesPorSessao] = useState({});
  const [visualizadasPorSessao, setVisualizadasPorSessao] = useState({});

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      refreshSessions();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedSession]);

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

    if (selectedSession) {
      loadMessages(selectedSession, true);
    }
  };

  const loadMessages = async (sessionId, silent = false) => {
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
      await axios.post(`${API_URL}/${selectedSession}/message`, {
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

  const encerrarSessao = async () => {
    if (selectedSession) {
      await axios.post(`${API_URL}/${selectedSession}/message`, {
        sender: 'Atendente: ',
        senderName: `${atendente}: `,
        text: 'Esta conversa foi encerrada. Caso precise de mais ajuda, inicie uma nova conversa no chat. 😊'
      });
      await axios.post(`${API_URL}/chat/${selectedSession}/end`);
      fetchSessions();
      setSelectedSession(null);
      setMessages([]);
    }
  };

  const handleChangeAtendente = (e) => {
    setAtendente(e.target.value);
    localStorage.setItem('atendenteNome', e.target.value);
  };

  const exportarConversa = () => {
    if (!messages.length) return;
    const conteudo = messages.map(m => `${m.senderName || m.sender} ${new Date(m.timestamp).toLocaleTimeString()} - ${m.text}`).join('\n');
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-${selectedSession}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMessages = messages.filter((msg) => {
    const matchKeyword = msg.text.toLowerCase().includes(filter.toLowerCase());
    const msgDate = new Date(msg.timestamp);
    const afterStart = startDate ? msgDate >= new Date(startDate) : true;
    const beforeEnd = endDate ? msgDate <= new Date(endDate + 'T23:59:59') : true;
    return matchKeyword && afterStart && beforeEnd;
  });

  const abertas = sessions.filter(s => s.status !== 'encerrada');
  const encerradas = sessions.filter(s => s.status === 'encerrada');

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg grid grid-cols-3">
        <aside className="col-span-1 border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Painel do Atendente</h2>
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

          <details open className="mb-4">
            <summary className="cursor-pointer font-medium text-[#0669F7] mb-2">Conversas em Aberto</summary>
            {abertas.map((session) => {
              const total = totalMessagesPorSessao[session.sessionId] || 0;
              const visualizadas = visualizadasPorSessao[session.sessionId] || 0;
              const hasNew = total > visualizadas && selectedSession !== session.sessionId;
              return (
                <button
                  key={session.sessionId}
                  onClick={() => loadMessages(session.sessionId)}
                  className={`block w-full text-left mb-2 px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
                    selectedSession === session.sessionId
                      ? 'bg-[#0669F7] text-white border-2 border-[#207CFF]'
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  Sessão {session.sessionId.slice(0, 8)}...{' '}
                  {hasNew && <span className="text-red-500">🔴</span>}<br />
                  <span className="text-xs text-gray-500">{session.lastMessage}</span>
                </button>
              );
            })}
          </details>

          <details>
            <summary className="cursor-pointer font-medium text-[#888] mb-2">Conversas Encerradas</summary>
            {encerradas.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => loadMessages(session.sessionId)}
                className={`block w-full text-left mb-2 px-3 py-2 rounded-lg text-sm border transition-all duration-200 ${
                    selectedSession === session.sessionId
                      ? 'bg-[#0669F7] text-white border-2 border-[#207CFF]'
                      : 'bg-gray-50 text-gray-500 border border-gray-300'
                  }`}
              >
                Sessão {session.sessionId.slice(0, 8)}...<br />
                <span className="text-xs text-gray-400">{session.lastMessage}</span>
              </button>
            ))}
          </details>

          <button onClick={onVoltar} className="mt-6 text-sm text-[#0669F7] underline">
            ← Voltar ao chat
          </button>
        </aside>

        <main className="col-span-2 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Mensagens</h2>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por palavra-chave..."
              className="px-3 py-2 text-sm border border-gray-300 rounded col-span-1"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded col-span-1"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded col-span-1"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-[#f9fbfc] p-3 rounded-lg border border-gray-200">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] px-4 py-2 text-sm rounded-lg shadow-sm whitespace-pre-wrap
                  ${msg.sender === 'Usuário: '
                    ? 'ml-auto bg-[#0669F7] text-white'
                    : 'mr-auto bg-[#e9f1ff] text-[#1e1e1e]'}
                `}
              >
                {msg.senderName && (
                  <span className="text-xs font-semibold block text-gray-500">
                    {msg.senderName} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {msg.text}
              </div>
            ))}
          </div>

          {selectedSession && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-2 gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-4 py-2 text-sm outline-none border border-gray-300 rounded-md"
                placeholder="Mensagem do atendente..."
              />
              <button
                onClick={sendMessage}
                className="bg-[#0669F7] hover:bg-[#207CFF] text-white text-sm font-medium px-6 py-2 rounded-md"
              >
                Enviar
              </button>
              <button
                onClick={encerrarSessao}
                className="bg-red-100 hover:bg-red-200 text-sm text-red-600 px-4 py-2 rounded-md"
              >
                Encerrar
              </button>
              <button
                onClick={exportarConversa}
                className="bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-4 py-2 rounded-md"
              >
                Exportar
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
