'use client';

import { useState, useEffect } from 'react';
import { formatBRLNumber } from '@/app/utils/formatters';

const getContaColor = (contaNome) => {
    switch (contaNome?.toLowerCase()) {
        case 'itaú':
            return 'bg-orange-500';
        case 'inter':
            return 'bg-orange-600';
        case 'bnb':
            return 'bg-blue-600';
        case 'safra':
            return 'bg-yellow-500';
        default:
            return 'bg-gray-500';
    }
};

export default function FluxoCaixaPage() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [movResponse, saldosResponse] = await Promise.all([
                fetch('http://localhost:8080/api/movimentacoes-caixa'),
                fetch('http://localhost:8080/api/dashboard/saldos')
            ]);
            if (!movResponse.ok || !saldosResponse.ok) {
                throw new Error('Falha ao buscar os dados.');
            }
            const movData = await movResponse.json();
            const saldosData = await saldosResponse.json();
            setMovimentacoes(movData);
            setSaldos(saldosData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleExcluir = async (movId) => {
        if (!window.confirm("Tem a certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/movimentacoes-caixa/${movId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Falha ao excluir o lançamento.');
            }
            await fetchData(); // Recarrega todos os dados para garantir consistência
        } catch (err) {
            alert(err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    if (loading) return <div className="text-center p-10">A carregar...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Erro: {error}</div>;

    const totalGeral = saldos.reduce((acc, conta) => acc + conta.saldo, 0);

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Fluxo de Caixa</h1>
                <p className="text-lg text-gray-600 mt-1">Todas as entradas e saídas financeiras.</p>
            </header>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Saldos Atuais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {saldos.map((conta) => (
                        <div key={conta.contaBancaria} className={`${getContaColor(conta.contaBancaria)} text-white p-6 rounded-lg shadow-lg`}>
                            <h3 className="text-lg font-semibold opacity-80">{conta.contaBancaria}</h3>
                            <p className="text-3xl font-bold mt-2">{formatBRLNumber(conta.saldo)}</p>
                        </div>
                    ))}
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-300">Total Geral</h3>
                        <p className="text-3xl font-bold mt-2">{formatBRLNumber(totalGeral)}</p>
                    </div>
                </div>
            </section>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movimentacoes.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(mov.dataMovimento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mov.descricao}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${mov.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.valor > 0 ? '+' : ''}{formatBRLNumber(mov.valor)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.contaBancaria}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        {(mov.categoria.includes('Avulsa') || mov.categoria.includes('Transferencia')) && (
                                            <button onClick={() => handleExcluir(mov.id)} className="text-red-500 hover:text-red-700 font-bold" title="Excluir Lançamento">
                                                &times;
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {movimentacoes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">Nenhuma movimentação encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
