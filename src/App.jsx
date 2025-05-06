// frontend/src/App.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import PainelAtendente from './PainelAtendente';
import LoginAtendente from './LoginAtendente';
import DashboardAdmin from './DashboardAdmin';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [atendenteLogado, setAtendenteLogado] = useState(localStorage.getItem('atendenteToken') || '');
  const [rota, setRota] = useState(window.location.pathname);

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  useEffect(() => {
    if (rota === '/atendente') return;
    const storedSession = localStorage.getItem('sessionId');
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      createSession();
    }
  }, [rota]);

  const createSession = async () => {
    const response = await axios.post(`${API_URL}/chat`);
    setSessionId(response.data.sessionId);
    localStorage.setItem('sessionId', response.data.sessionId);
    setMessages([]);
    setIsSessionClosed(false);
  };

  useEffect(() => {
    if (rota === '/atendente') return;
    const interval = setInterval(() => {
      if (sessionId) fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionId, rota]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/${sessionId}/messages`);
      setMessages(response.data);

      const encerrada = response.data.some(msg =>
        msg.text.toLowerCase().includes('esta conversa foi encerrada')
      );
      setIsSessionClosed(encerrada);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (text.trim() && !isSessionClosed) {
      try {
        await axios.post(`${API_URL}/${sessionId}/message`, {
          sender: 'Usuário: ',
          senderName: 'Você: ',
          text
        });
        setText('');
        await fetchMessages();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // evita quebra de linha
      sendMessage();
    }
  };
		
  const realizarLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { usuario, senha });
      if (res.data.success) {
        localStorage.setItem('atendenteToken', res.data.token);
        localStorage.setItem('atendenteNome', res.data.usuario);
        setAtendenteLogado(res.data.usuario);
        setErroLogin('');
      }
    } catch (e) {
      setErroLogin('Usuário ou senha inválidos');
    }
  };

  if (rota === '/admin') {
    return <DashboardAdmin />;
  }
  
  if (rota === '/atendente' && !atendenteLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-6 border rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold text-[#0669F7] mb-4">Login do Atendente</h2>
          {erroLogin && <p className="text-red-600 text-sm mb-2">{erroLogin}</p>}
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuário"
            className="w-full mb-3 px-3 py-2 border rounded"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full mb-4 px-3 py-2 border rounded"
          />
          <button
            onClick={realizarLogin}
            className="w-full bg-[#0669F7] text-white px-4 py-2 rounded hover:bg-[#1469E3]"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (rota === '/atendente' && atendenteLogado) {
    return <PainelAtendente atendente={atendenteLogado} onVoltar={() => {
      setAtendenteLogado('');
      localStorage.removeItem('atendenteToken');
      localStorage.removeItem('atendenteNome');
    }} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-[#0669F7] mb-2">Chat Online</h1>
      <div className="w-full max-w-md border border-[#207CFF] rounded-lg p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-lg whitespace-pre-wrap ${msg.sender === 'Usuário: ' ? 'bg-[#0669F7] text-white self-end' : 'bg-gray-200 self-start'}`}
            >
              <span className="text-sm font-semibold block mb-1">{msg.senderName} <span className="text-gray-400">- {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
              <span className="text-sm">{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="flex mb-2">
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
        {isSessionClosed && (
          <button
            onClick={() => {
              localStorage.removeItem('sessionId');
              createSession();
            }}
            className="mt-2 text-sm text-[#0669F7] underline"
          >
            Iniciar nova conversa
          </button>
        )}
      </div>
    </div>
  );
}
