'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notification from '@/app/components/Notification';
import UserModal from '@/app/components/UserModal';

const API_URL = 'http://localhost:8080/api/users';

export default function UsuariosPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const getAuthHeader = () => {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, { headers: getAuthHeader() });
            if (response.status === 403) throw new Error("Acesso negado. Apenas administradores podem ver esta página.");
            if (!response.ok) throw new Error("Falha ao carregar usuários.");
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSave = async (userData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Falha ao criar usuário.");
            }
            showNotification("Usuário criado com sucesso!", "success");
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    return (
        <main className="p-4 sm:p-6">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={editingUser}
            />
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
            </header>
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Clientes (Cedentes)</Link>
                    <Link href="/cadastros/sacados" className="border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Sacados (Devedores)</Link>
                    <Link href="/cadastros/tipos-operacao" className="border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Tipos de Operação</Link>
                    <Link href="/cadastros/usuarios" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Usuários</Link>
                </nav>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-end mb-4">
                    <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md">Novo Usuário</button>
                </div>
                {loading && <p>A carregar...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Telefone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Cargo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 text-sm font-medium">{user.username}</td>
                                    <td className="px-6 py-4 text-sm">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">{user.telefone}</td>
                                    <td className="px-6 py-4 text-sm">{user.roles}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
}