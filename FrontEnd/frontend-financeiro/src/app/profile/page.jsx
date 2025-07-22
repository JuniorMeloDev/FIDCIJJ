'use client';

import { useState, useEffect } from 'react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Notification from '../components/Notification';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const handlePasswordSave = async (passwordData) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/api/users/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Falha ao alterar a senha.");
            }
            showNotification("Senha alterada com sucesso!", "success");
            setIsModalOpen(false);

        } catch (err) {
            showNotification(err.message, 'error');
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Não autenticado.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do perfil.');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div className="p-8">A carregar perfil...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <ChangePasswordModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handlePasswordSave}
            />
            <main className="p-4 sm:p-6">
                <header className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Perfil do Usuário</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                        Alterar Senha
                    </button>
                </header>
                
                {user && (
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                        <h2 className="text-xl font-semibold border-b pb-3 mb-4">Informações</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nome</label>
                                <p className="mt-1 text-lg text-gray-900">{user.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Login do Usuário</label>
                                <p className="mt-1 text-lg text-gray-900">{user.email || 'Não informado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">E-mail</label>
                                <p className="mt-1 text-lg text-gray-900">{user.email || 'Não informado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Telefone</label>
                                <p className="mt-1 text-lg text-gray-900">{user.telefone || 'Não informado'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}