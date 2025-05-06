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
      console.error('Erro ao buscar dados da supervisão:', error);
    }
  };

  useEffect(() => {
    fetchDados();
    const interval = setInterval(fetchDados, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!dados) return <p className="p-4">Carregando dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-[#0669F7] mb-4">Dashboard de Supervisão</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#E6F0FF] p-4 rounded-lg shadow">
            <h2 className="text-sm text-gray-500">Sessões Abertas</h2>
            <p className="text-2xl font-bold text-[#0669F7]">{dados.totalAberta}</p>
          </div>
          <div className="bg-[#FFF0F0] p-4 rounded-lg shadow">
            <h2 className="text-sm text-gray-500">Sessões Encerradas</h2>
            <p className="text-2xl font-bold text-red-500">{dados.totalEncerrada}</p>
          </div>
          <div className="bg-[#E8FFF0] p-4 rounded-lg shadow">
            <h2 className="text-sm text-gray-500">Em Atendimento</h2>
            <p className="text-2xl font-bold text-green-600">{dados.totalEmAtendimento}</p>
          </div>
          <div className="bg-[#FFFBE6] p-4 rounded-lg shadow">
            <h2 className="text-sm text-gray-500">Aguardando Atendimento</h2>
            <p className="text-2xl font-bold text-yellow-600">{dados.aguardandoAtendimento}</p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Sessões por Atendente</h2>
          {Object.keys(dados.porAtendente).length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum atendente ativo.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(dados.porAtendente).map(([nome, qtd]) => (
                <li key={nome} className="flex justify-between border-b pb-1 text-sm">
                  <span>{nome}</span>
                  <span className="font-semibold text-[#0669F7]">{qtd}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
