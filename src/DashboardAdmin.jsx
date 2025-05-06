// frontend/src/DashboardAdmin.jsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = 'https://omnichat-backend-dydpc9ddg5cnd3a9.brazilsouth-01.azurewebsites.net/api';
const COLORS = ['#0669F7', '#10B981', '#F59E0B', '#6B7280'];

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

  const pieData = [
    { name: 'Em Aberto', value: dados.totalAberta },
    { name: 'Em Atendimento', value: dados.totalEmAtendimento },
    { name: 'Aguardando', value: dados.aguardandoAtendimento },
    { name: 'Encerradas', value: dados.totalEncerrada },
  ];

  const barData = Object.entries(dados.porAtendente).map(([nome, total]) => ({ nome, total }));

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <h1 className="text-2xl font-bold text-[#0669F7] mb-6">Dashboard de Supervisão</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <ResumoBox titulo="Conversas em Aberto" valor={dados.totalAberta} cor="bg-blue-100 text-blue-800" />
        <ResumoBox titulo="Em Atendimento" valor={dados.totalEmAtendimento} cor="bg-green-100 text-green-800" />
        <ResumoBox titulo="Aguardando Atendimento" valor={dados.aguardandoAtendimento} cor="bg-yellow-100 text-yellow-800" />
        <ResumoBox titulo="Conversas Encerradas" valor={dados.totalEncerrada} cor="bg-gray-100 text-gray-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Distribuição das Sessões</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Atendentes em Atendimento</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="nome" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#0669F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
