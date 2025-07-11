'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import EditSacadoModal from '@/app/components/EditSacadoModal';
import Notification from '@/app/components/Notification';
import ConfirmacaoModal from '@/app/components/ConfirmacaoModal'; // Importa o modal
import Pagination from '@/app/components/Pagination';
import FiltroLateralSacados from '@/app/components/FiltroLateralSacados';
import { formatCnpjCpf, formatTelefone } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api/cadastros';
const ITEMS_PER_PAGE = 10;

export default function SacadosPage() {
    const [sacados, setSacados] = useState([]);
    const [tiposOperacao, setTiposOperacao] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSacado, setEditingSacado] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ nome: '', cnpj: '' });
    
    // Novo estado para controlar o modal de confirmação
    const [sacadoParaExcluir, setSacadoParaExcluir] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sacadosRes, tiposRes] = await Promise.all([
                fetch(`${API_URL}/sacados`),
                fetch(`${API_URL}/tipos-operacao`)
            ]);
            if (!sacadosRes.ok) throw new Error('Falha ao carregar sacados.');
            if (!tiposRes.ok) throw new Error('Falha ao carregar tipos de operação.');
            
            setSacados(await sacadosRes.json());
            setTiposOperacao(await tiposRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSacados = useMemo(() => {
        return sacados.filter(sacado => {
            const nomeMatch = !filters.nome || sacado.nome.toLowerCase().includes(filters.nome.toLowerCase());
            const cnpjMatch = !filters.cnpj || (sacado.cnpj && sacado.cnpj.includes(filters.cnpj.replace(/\D/g, '')));
            return nomeMatch && cnpjMatch;
        });
    }, [filters, sacados]);

    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setCurrentPage(1);
        setFilters({ nome: '', cnpj: '' });
    };

    const handleOpenAddModal = () => { setEditingSacado(null); setIsModalOpen(true); };
    const handleOpenEditModal = (sacado) => { setEditingSacado(sacado); setIsModalOpen(true); };

    const handleSaveSacado = async (id, data) => {
        const isUpdating = !!id;
        const url = isUpdating ? `${API_URL}/sacados/${id}` : `${API_URL}/sacados`;
        const method = isUpdating ? 'PUT' : 'POST';
        try {
            const payload = { ...data };
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao salvar o sacado.');
            }
            setIsModalOpen(false);
            await fetchData();
            showNotification(`Sacado ${isUpdating ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };
    
    // 1. Esta função é chamada pelo botão "Excluir" e abre o modal de confirmação
    const handleDeleteRequest = (id) => {
        const sacado = sacados.find(s => s.id === id);
        setSacadoParaExcluir(sacado);
    };

    // 2. Esta função é chamada pelo "Sim" do modal e executa a exclusão
    const handleConfirmarExclusao = async () => {
        if (!sacadoParaExcluir) return;
        try {
            const response = await fetch(`${API_URL}/sacados/${sacadoParaExcluir.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir o sacado.');
            showNotification('Sacado excluído com sucesso!', 'success');
            await fetchData();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setSacadoParaExcluir(null); // Fecha o modal de confirmação
            setIsModalOpen(false);      // Fecha o modal de edição
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredSacados.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 sm:p-6 flex flex-col h-full">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            
            <EditSacadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sacado={editingSacado}
                onSave={handleSaveSacado}
                onDelete={handleDeleteRequest} // Atualizado para chamar a confirmação
                showNotification={showNotification}
                tiposOperacao={tiposOperacao}
            />

            <ConfirmacaoModal
                isOpen={!!sacadoParaExcluir}
                onClose={() => setSacadoParaExcluir(null)}
                onConfirm={handleConfirmarExclusao}
                title="Confirmar Exclusão"
                message={`Deseja excluir o sacado "${sacadoParaExcluir?.nome}"?`}
            />
            
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600">Gestão de Clientes e Sacados</p>
            </header>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Clientes (Cedentes)</Link>
                    <Link href="/cadastros/sacados" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Sacados (Devedores)</Link>
                    <Link href="/cadastros/tipos-operacao" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Tipos de Operação</Link>
                </nav>
            </div>
            <div className="flex-grow flex flex-col lg:flex-row gap-6">
                <FiltroLateralSacados filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} onApply={() => {}} />
                <div className="flex-grow bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">Novo Sacado</button>
                    </div>
                    <div className="overflow-auto">
                        {loading ? <p className="text-center py-10">A carregar...</p> : error ? <p className="text-red-500 text-center py-10">{error}</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Município</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((sacado) => (
                                        <tr key={sacado.id} onClick={() => handleOpenEditModal(sacado)} className="hover:bg-gray-100 cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{sacado.nome}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatCnpjCpf(sacado.cnpj)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{sacado.municipio ? `${sacado.municipio} - ${sacado.uf}`: ''}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatTelefone(sacado.fone)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <Pagination totalItems={filteredSacados.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </main>
    );
}