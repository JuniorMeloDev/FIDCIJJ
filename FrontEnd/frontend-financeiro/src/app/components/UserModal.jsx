'use client';

import { useState, useEffect } from 'react';
import { formatTelefone } from '@/app/utils/formatters';

export default function UserModal({ isOpen, onClose, onSave, user }) {
    const [formData, setFormData] = useState({ username: '', email: '', telefone: '', password: '' });
    const isEditMode = !!user;

    useEffect(() => {
        if (isOpen) {
            const initialData = user 
                ? { ...user, password: '', telefone: user.telefone ? formatTelefone(user.telefone) : '' } 
                : { username: '', email: '', telefone: '', password: '' };
            setFormData(initialData);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'telefone') {
            setFormData(prev => ({ ...prev, [name]: formatTelefone(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        onSave({
            ...formData,
            telefone: formData.telefone.replace(/\D/g, '')
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="text" name="telefone" value={formData.telefone || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'Deixe em branco para não alterar' : ''} className="mt-1 block w-full border-gray-300 rounded-md p-2"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md">Cancelar</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md">Salvar</button>
                </div>
            </div>
        </div>
    );
}