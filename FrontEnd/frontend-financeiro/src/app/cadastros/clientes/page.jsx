'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditClienteModal from '@/app/components/EditClienteModal';
import Notification from '@/app/components/Notification';
import { formatCnpjCpf } from '@/app/utils/formatters'; 

const API_URL = 'http://localhost:8080/api/cadastros';

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleOpenAddModal = () => {
        setEditingCliente(null); // Passa null para indicar que é um novo cliente
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cliente) => {
        setEditingCliente(cliente);
        setIsModalOpen(true);
    };

    const handleSaveCliente = async (id, data) => {
        const isUpdating = !!id;
        const url = isUpdating ? `${API_URL}/clientes/${id}` : `${API_URL}/clientes`;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
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
    
    const handleDeleteCliente = async (id) => {
        try {
            const response = await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir o cliente.');
            
            setIsModalOpen(false);
            await fetchClientes();
            showNotification('Cliente excluído com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    return (
        <main className="p-4 sm:p-6 flex flex-col h-full">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <EditClienteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cliente={editingCliente}
                onSave={handleSaveCliente}
                onDelete={handleDeleteCliente}
            />
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600">Gestão de Clientes e Sacados</p>
            </header>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Clientes (Cedentes)
                    </Link>
                    <Link href="/cadastros/sacados" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Sacados (Devedores)
                    </Link>
                </nav>
            </div>
            <div className="flex justify-end mb-4">
                <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">
                    Novo Cliente
                </button>
            </div>
            <div className="flex-grow bg-white p-4 rounded-lg shadow-md">
                <div className="overflow-auto">
                    {loading ? <p>A carregar...</p> : error ? <p className="text-red-500">{error}</p> : (
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
                                {clientes.map((cliente) => (
                                    <tr key={cliente.id} onClick={() => handleOpenEditModal(cliente)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-6 py-4 text-sm text-gray-500">{cliente.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{cliente.nome}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatCnpjCpf(cliente.cnpj)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{cliente.municipio} - {cliente.uf}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}