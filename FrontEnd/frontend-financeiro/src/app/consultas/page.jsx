'use client';

import { useState, useEffect } from 'react';

export default function ConsultasPage() {
    const [duplicatas, setDuplicatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Função para buscar os dados da API
        const fetchDuplicatas = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/duplicatas');
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados da API.');
                }
                const data = await response.json();
                setDuplicatas(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDuplicatas();
    }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading) {
        return <div className="text-center p-10">Carregando dados...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Erro: {error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800">
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Consulta de Duplicatas Operadas</h1>
                    <p className="text-lg text-gray-600 mt-1">Histórico completo de todas as duplicatas processadas.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Op.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NF/CT-e</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cedente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sacado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Bruto</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Juros</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Venc.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {duplicatas.map((dup) => (
                                    <tr key={dup.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(dup.dataOperacao)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dup.nfCte}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dup.empresaCedente}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dup.clienteSacado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(dup.valorBruto)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatCurrency(dup.valorJuros)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(dup.dataVencimento)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {dup.tipoOperacao.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {duplicatas.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-gray-500">Nenhuma duplicata encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
