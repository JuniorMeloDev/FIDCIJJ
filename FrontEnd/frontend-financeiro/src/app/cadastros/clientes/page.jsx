'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import EditClienteModal from '@/app/components/EditClienteModal';
import Notification from '@/app/components/Notification';
import ConfirmacaoModal from '@/app/components/ConfirmacaoModal';
import Pagination from '@/app/components/Pagination';
import FiltroLateralClientes from '@/app/components/FiltroLateralClientes';
import { formatCnpjCpf } from '@/app/utils/formatters'; 

const API_URL = 'http://localhost:8080/api/cadastros';
const ITEMS_PER_PAGE = 4; 

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ nome: '', cnpj: '' });

    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/clientes`, {
                headers: getAuthHeader()
            });
            if (!response.ok) throw new Error('Falha ao carregar clientes. Verifique se está logado.');
            const data = await response.json();
            setClientes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const filteredClientes = useMemo(() => {
        return clientes.filter(cliente => {
            const nomeMatch = !filters.nome || cliente.nome.toLowerCase().includes(filters.nome.toLowerCase());
            const cnpjMatch = !filters.cnpj || (cliente.cnpj && cliente.cnpj.includes(filters.cnpj.replace(/\D/g, '')));
            return nomeMatch && cnpjMatch;
        });
    }, [filters, clientes]);
    
    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const clearFilters = () => {
        setCurrentPage(1);
        setFilters({ nome: '', cnpj: '' });
    };

    const handleOpenAddModal = () => { setEditingCliente(null); setIsModalOpen(true); };
    const handleOpenEditModal = (cliente) => { setEditingCliente(cliente); setIsModalOpen(true); };

    const handleSaveCliente = async (id, data) => {
        const isUpdating = !!id;
        const url = isUpdating ? `${API_URL}/clientes/${id}` : `${API_URL}/clientes`;
        const method = isUpdating ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao salvar cliente.');
            }
            setIsModalOpen(false);
            await fetchClientes();
            showNotification(`Cliente ${isUpdating ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleDeleteRequest = (id) => {
        const cliente = clientes.find(c => c.id === id);
        setClienteParaExcluir(cliente);
    };

    const handleConfirmarExclusao = async () => {
        if (!clienteParaExcluir) return;
        try {
            const response = await fetch(`${API_URL}/clientes/${clienteParaExcluir.id}`, { 
                method: 'DELETE',
                headers: getAuthHeader()
            });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            showNotification('Cliente excluído com sucesso!', 'success');
            await fetchClientes();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setClienteParaExcluir(null);
            setIsModalOpen(false);
        }
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 sm:p-6 flex flex-col h-full">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <EditClienteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} cliente={editingCliente} onSave={handleSaveCliente} onDelete={handleDeleteRequest} showNotification={showNotification} />
            <ConfirmacaoModal isOpen={!!clienteParaExcluir} onClose={() => setClienteParaExcluir(null)} onConfirm={handleConfirmarExclusao} title="Confirmar Exclusão" message={`Deseja excluir o cliente "${clienteParaExcluir?.nome}"?`} />
            
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600">Gestão de Clientes, Sacados, Operações e Usuários</p>
            </header>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Clientes (Cedentes)</Link>
                    <Link href="/cadastros/sacados" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Sacados (Devedores)</Link>
                    <Link href="/cadastros/tipos-operacao" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Tipos de Operação
                    </Link>
                    <Link href="/cadastros/usuarios" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Usuários
                    </Link>
                </nav>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row gap-6">
                <FiltroLateralClientes 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={clearFilters}
                    onApply={() => {}} 
                />
                <div className="flex-grow bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">Novo Cliente</button>
                    </div>
                    <div className="overflow-auto">
                        {loading ? <p className="text-center py-10">A carregar...</p> : error ? <p className="text-red-500 text-center py-10">{error}</p> : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Município</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((cliente) => (
                                        <tr key={cliente.id} onClick={() => handleOpenEditModal(cliente)} className="hover:bg-gray-100 cursor-pointer">
                                            <td className="px-6 py-4 text-sm text-gray-500">{cliente.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{cliente.nome}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatCnpjCpf(cliente.cnpj)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{cliente.municipio ? `${cliente.municipio} - ${cliente.uf}` : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <Pagination totalItems={filteredClientes.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </main>
    );
}