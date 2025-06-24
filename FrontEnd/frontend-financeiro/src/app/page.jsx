'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSaldos = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/dashboard/saldos');
                if (!response.ok) {
                    throw new Error('Falha ao buscar os saldos.');
                }
                const data = await response.json();
                setSaldos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSaldos();
    }, []);

    const formatCurrency = (value) => {
        const number = typeof value === 'number' ? value : 0;
        return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const totalGeral = saldos.reduce((acc, conta) => acc + conta.saldo, 0);

    return (
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">Visão geral dos saldos das suas contas.</p>
            </header>

            {loading && <div className="text-center p-10">A carregar dashboard...</div>}
            {error && <div className="text-center p-10 text-red-500">Erro: {error}</div>}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {saldos.map((conta) => (
                        <div key={conta.contaBancaria} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-500">{conta.contaBancaria}</h3>
                            <p className={`text-3xl font-bold mt-2 ${conta.saldo >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                {formatCurrency(conta.saldo)}
                            </p>
                        </div>
                    ))}
                    {/* Card para o Total Geral */}
                    <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-indigo-100">Total Geral</h3>
                        <p className="text-3xl font-bold mt-2">
                            {formatCurrency(totalGeral)}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
