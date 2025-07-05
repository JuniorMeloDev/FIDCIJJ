'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditClienteModal from '@/app/components/EditClienteModal';
import Notification from '@/app/components/Notification';
import { formatCnpjCpf } from '@/app/utils/formatters'; 
import Pagination from '@/app/components/Pagination';

const ITEMS_PER_PAGE = 20;
const API_URL = 'http://localhost:8080/api/cadastros';

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Estados para o formulário de novo cliente
    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para controlar o modal de edição
    const [editingCliente, setEditingCliente] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/clientes`);
            if (!response.ok) throw new Error('Falha ao carregar clientes.');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const cleanCnpj = cnpj.replace(/\D/g, '');
            const response = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, cnpj: cleanCnpj }),
            });
            if (!response.ok) throw new Error('Falha ao criar cliente.');
            setNome('');
            setCnpj('');
            await fetchClientes(); // Atualiza a lista
            showNotification('Cliente criado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCliente = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Falha ao atualizar o cliente.');
            
            setEditingCliente(null);
            await fetchClientes();
            showNotification('Cliente atualizado com sucesso!', 'success');

        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleDeleteCliente = async (id) => {
        try {
            const response = await fetch(`${API_URL}/clientes/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            
            setEditingCliente(null);
            setClientes(clientes.filter(c => c.id !== id));
            showNotification('Cliente excluído com sucesso!', 'success');

        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Lógica para a paginação
    const currentItems = clientes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <EditClienteModal
                isOpen={!!editingCliente}
                onClose={() => setEditingCliente(null)}
                cliente={editingCliente}
                onSave={handleUpdateCliente}
                onDelete={handleDeleteCliente}
            />
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600 mt-1">Gestão de Clientes e Sacados</p>
            </header>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Clientes (Cedentes)
                    </Link>
                    <Link href="/cadastros/sacados" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Sacados (Devedores)
                    </Link>
                </nav>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Adicionar Novo Cliente</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                        <input type="text" id="nome" value={nome} onChange={e => setNome(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <input type="text" id="cnpj" value={cnpj} onChange={e => setCnpj(formatCnpjCpf(e.target.value))} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="md:col-start-3">
                        <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isSubmitting ? 'A guardar...' : 'Guardar Cliente'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Clientes Registados</h2>
                <div className="overflow-x-auto">
                    {loading && <p>A carregar...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((cliente) => (
                                    <tr key={cliente.id} onClick={() => setEditingCliente(cliente)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-4 py-2 text-xs text-gray-500">{cliente.id}</td>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{cliente.nome}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{formatCnpjCpf(cliente.cnpj)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Pagination totalItems={clientes.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </main>
    );
}
