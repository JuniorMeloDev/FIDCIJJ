'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Pagination from '@/app/components/Pagination';
import Notification from '@/app/components/Notification';
import FiltroLateralTiposOperacao from '@/app/components/FiltroLateralTiposOperacao';
import EditTipoOperacaoModal from '@/app/components/EditTipoOperacaoModal';
import ConfirmacaoModal from '@/app/components/ConfirmacaoModal'; // Importa o modal de confirmação
import { formatBRLNumber } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api/cadastros';
const ITEMS_PER_PAGE = 10;

export default function TiposOperacaoPage() {
    const [tiposOperacao, setTiposOperacao] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOperacao, setEditingOperacao] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [filters, setFilters] = useState({ nome: '' });
    
    // Novo estado para o modal de confirmação
    const [operacaoParaExcluir, setOperacaoParaExcluir] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchTiposOperacao = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/tipos-operacao`);
            if (!response.ok) throw new Error('Falha ao carregar os tipos de operação.');
            setTiposOperacao(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiposOperacao();
    }, []);

    const filteredItems = useMemo(() => {
        return tiposOperacao.filter(item => 
            item.nome.toLowerCase().includes(filters.nome.toLowerCase())
        );
    }, [filters, tiposOperacao]);

    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setCurrentPage(1);
        setFilters({ nome: '' });
    };

    const handleOpenAddModal = () => {
        setEditingOperacao(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingOperacao(item);
        setIsModalOpen(true);
    };

    const handleSave = async (id, data) => {
        const isUpdating = !!id;
        const url = isUpdating ? `${API_URL}/tipos-operacao/${id}` : `${API_URL}/tipos-operacao`;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Falha ao ${isUpdating ? 'atualizar' : 'criar'} tipo de operação.`);
            
            showNotification(`Operação ${isUpdating ? 'atualizada' : 'criada'} com sucesso!`, 'success');
            setIsModalOpen(false);
            await fetchTiposOperacao();
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Abre o modal de confirmação
    const handleDeleteRequest = (id) => {
        const operacao = tiposOperacao.find(op => op.id === id);
        setOperacaoParaExcluir(operacao);
    };
    
    // Executa a exclusão após confirmação
    const handleConfirmarExclusao = async () => {
        if (!operacaoParaExcluir) return;
        try {
            const response = await fetch(`${API_URL}/tipos-operacao/${operacaoParaExcluir.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir. Este tipo de operação pode estar em uso.');
            showNotification('Tipo de operação excluído com sucesso!', 'success');
            await fetchTiposOperacao();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setOperacaoParaExcluir(null); // Fecha o modal de confirmação
            setIsModalOpen(false);      // Fecha o modal de edição
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 sm:p-6 flex flex-col h-full">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <EditTipoOperacaoModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                onDelete={handleDeleteRequest} // Modificado para chamar a confirmação
                tipoOperacao={editingOperacao} 
            />
            <ConfirmacaoModal
                isOpen={!!operacaoParaExcluir}
                onClose={() => setOperacaoParaExcluir(null)}
                onConfirm={handleConfirmarExclusao}
                title="Confirmar Exclusão"
                message={`Deseja excluir o tipo de operação "${operacaoParaExcluir?.nome}"?`}
            />
            
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600">Gestão de Clientes, Sacados e Tipos de Operação</p>
            </header>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Clientes (Cedentes)
                    </Link>
                    <Link href="/cadastros/sacados" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Sacados (Devedores)
                    </Link>
                    <Link href="/cadastros/tipos-operacao" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Tipos de Operação
                    </Link>
                </nav>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row gap-6">
                <FiltroLateralTiposOperacao filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} onApply={() => {}} />
                <div className="flex-grow bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">Nova Operação</button>
                    </div>
                    <div className="overflow-auto">
                        {loading ? <p className="text-center py-10">A carregar...</p> : error ? <p className="text-red-500 text-center py-10">{error}</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxa (%)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Fixo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Desp. Bancárias</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((item) => (
                                        <tr key={item.id} onClick={() => handleOpenEditModal(item)} className="hover:bg-gray-100 cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.taxaJuros.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatBRLNumber(item.valorFixo)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatBRLNumber(item.despesasBancarias)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <Pagination totalItems={filteredItems.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </main>
    );
}