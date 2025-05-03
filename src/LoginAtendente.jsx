// frontend/src/LoginAtendente.jsx

import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function LoginAtendente({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { usuario, senha });
      if (res.data.success) {
        localStorage.setItem('atendenteToken', res.data.token);
        localStorage.setItem('atendenteNome', res.data.usuario);
        onLogin(res.data.usuario);
      }
    } catch (e) {
      setErro('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center text-[#0669F7] mb-6">Login do Atendente</h2>

        {erro && <p className="text-red-600 text-sm mb-3 text-center">{erro}</p>}

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Usuário</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            placeholder="Digite sua senha"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-[#0669F7] hover:bg-[#207CFF] text-white py-2 rounded font-medium"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
