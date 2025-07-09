'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatBRLNumber, formatDate } from '@/app/utils/formatters';
import Pagination from '@/app/components/Pagination';
import LancamentoModal from '@/app/components/LancamentoModal';
import FiltroLateral from '@/app/components/FiltroLateral'; // 
import Notification from '@/app/components/Notification'; // 

const ITEMS_PER_PAGE = 7;

export default function FluxoCaixaPage() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' }); // Estado para a notificação

    const [filters, setFilters] = useState({
        dataInicio: '', dataFim: '',
        contaBancaria: '', descricao: ''
    });

    const empresas = ["Recife", "Transrec", "PE"];

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchData = useCallback(async () => {
        // ... (esta função continua igual)
        setLoading(true);
        try {
            const movPromise = fetch('http://localhost:8080/api/movimentacoes-caixa').then(res => res.json());
            const saldosPromise = fetch('http://localhost:8080/api/dashboard/saldos').then(res => res.json());
            const [movData, saldosData] = await Promise.all([movPromise, saldosPromise]);
            setMovimentacoes(movData);
            setSaldos(saldosData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredMovimentacoes = useMemo(() => {
        // ... (esta função continua igual)
        return movimentacoes.filter(m => {
            const dataInicioMatch = !filters.dataInicio || new Date(m.dataMovimento) >= new Date(filters.dataInicio);
            const dataFimMatch = !filters.dataFim || new Date(m.dataMovimento) <= new Date(filters.dataFim);
            const contaMatch = !filters.contaBancaria || m.contaBancaria === filters.contaBancaria;
            const descricaoMatch = !filters.descricao || m.descricao.toLowerCase().includes(filters.descricao.toLowerCase());
            return dataInicioMatch && dataFimMatch && contaMatch && descricaoMatch;
        });
    }, [filters, movimentacoes]);

    const movimentacoesComSaldo = useMemo(() => {
        // ... (esta função continua igual)
        const reversedMovs = [...filteredMovimentacoes].reverse();
        let saldoAcumulado = 0;
        if (filters.dataInicio) {
            saldoAcumulado = movimentacoes
                .filter(m => new Date(m.dataMovimento) < new Date(filters.dataInicio) && (!filters.contaBancaria || m.contaBancaria === filters.contaBancaria))
                .reduce((sum, mov) => sum + mov.valor, 0);
        }
        const processedMovs = reversedMovs.map(mov => {
            saldoAcumulado += mov.valor;
            return { ...mov, saldo: saldoAcumulado };
        });
        return processedMovs.reverse();
    }, [filteredMovimentacoes, movimentacoes, filters.dataInicio, filters.contaBancaria]);

    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setCurrentPage(1);
        setFilters({ dataInicio: '', dataFim: '', contaBancaria: '', descricao: '' });
    };

    // FUNÇÃO ATUALIZADA para mostrar a notificação
    const handleSaveLancamento = async (lancamento) => {
        try {
            const response = await fetch('http://localhost:8080/api/lancamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lancamento),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao criar o lançamento.');
            }
            showNotification('Lançamento salvo com sucesso!', 'success');
            await fetchData(); // Recarrega os dados para refletir a nova entrada
            return true;
        } catch (err) {
            console.error(err);
            showNotification(err.message, 'error'); // Mostra a notificação de erro
            return false;
        }
    };
    
    const totalGeral = movimentacoesComSaldo.length > 0 ? movimentacoesComSaldo[0].saldo : 0;
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = movimentacoesComSaldo.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="text-center p-10">A carregar...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Erro: {error}</div>;

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <LancamentoModal 
                isOpen={isLancamentoModalOpen}
                onClose={() => setIsLancamentoModalOpen(false)}
                onSave={handleSaveLancamento}
                contas={saldos}
                empresas={empresas}
            />
            <main className="p-4 sm:p-6 flex flex-col h-full">
                <header className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Conciliação Bancária</h1>
                    <p className="text-sm text-gray-600">Visualize e concilie suas movimentações financeiras.</p>
                </header>
                <div className="flex-grow flex flex-col lg:flex-row gap-6">
                    <FiltroLateral 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApply={() => setCurrentPage(1)}
                        onClear={clearFilters}
                        saldos={saldos}
                    />
                    <div className="flex-grow bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <div>
                                <span className="text-sm text-gray-500">Saldo Final do Período:</span>
                                <p className={`text-xl font-bold ${totalGeral >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {formatBRLNumber(totalGeral)}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsLancamentoModalOpen(true)}
                                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700"
                            >
                                Novo Lançamento
                            </button>
                        </div>
                        <div className="overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Data</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-2/5">Descrição</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-1/5">Valor</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-1/5">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatDate(mov.dataMovimento)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{mov.descricao}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold text-right ${mov.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {mov.valor > 0 ? '+' : ''}{formatBRLNumber(mov.valor)}
                                            </td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold text-right ${mov.saldo >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                                {formatBRLNumber(mov.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination totalItems={filteredMovimentacoes.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                    </div>
                </div>
            </main>
        </>
    );
}