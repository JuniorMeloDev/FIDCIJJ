'use client';

import { useState, useEffect } from 'react';

export default function FluxoCaixaPage() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovimentacoes = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/movimentacoes-caixa');
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados do fluxo de caixa.');
                }
                const data = await response.json();
                setMovimentacoes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovimentacoes();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const formatCurrency = (value) => {
        const number = typeof value === 'number' ? value : 0;
        return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading) {
        return <div className="text-center p-10">A carregar movimentações...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Erro: {error}</div>;
    }

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Fluxo de Caixa</h1>
                <p className="text-lg text-gray-600 mt-1">Todas as entradas e saídas financeiras.</p>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movimentacoes.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(mov.dataMovimento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mov.descricao}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${mov.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.valor > 0 ? '+' : ''}{formatCurrency(mov.valor)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.contaBancaria}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mov.empresaAssociada}</td>
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
