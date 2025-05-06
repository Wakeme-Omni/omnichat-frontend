// frontend/src/DashboardAdmin.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';

export default function DashboardAdmin() {
  const [dados, setDados] = useState(null);

  const fetchDados = async () => {
    try {
      const response = await axios.get(`${API_URL}/supervisao`);
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar supervisão:', error);
    }
  };

  useEffect(() => {
    fetchDados();
    const interval = setInterval(fetchDados, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!dados) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <h1 className="text-2xl font-bold text-[#0669F7] mb-6">Dashboard de Supervisão</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <ResumoBox titulo="Conversas em Aberto" valor={dados.totalAberta} cor="bg-blue-100 text-blue-800" />
        <ResumoBox titulo="Em Atendimento" valor={dados.totalEmAtendimento} cor="bg-green-100 text-green-800" />
        <ResumoBox titulo="Aguardando Atendimento" valor={dados.aguardandoAtendimento} cor="bg-yellow-100 text-yellow-800" />
        <ResumoBox titulo="Conversas Encerradas" valor={dados.totalEncerrada} cor="bg-gray-100 text-gray-800" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Atendentes em Atendimento</h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Object.entries(dados.porAtendente).map(([nome, total]) => (
            <li key={nome}>
              <span className="font-medium">{nome}</span>: {total} conversa(s)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ResumoBox({ titulo, valor, cor }) {
  return (
    <div className={`p-4 rounded-lg shadow ${cor}`}>
      <p className="text-sm font-medium mb-1">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
