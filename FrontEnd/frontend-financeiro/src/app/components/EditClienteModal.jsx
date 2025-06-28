'use client';

import { useState, useEffect } from 'react';
import { formatCnpjCpf } from '@/app/utils/formatters';

export default function EditClienteModal({ isOpen, onClose, cliente, onSave, onDelete }) {
    const [formData, setFormData] = useState({ nome: '', cnpj: '' });

    useEffect(() => {
        if (cliente) {
            setFormData({
                nome: cliente.nome || '',
                cnpj: cliente.cnpj ? formatCnpjCpf(cliente.cnpj) : ''
            });
        }
    }, [cliente]);

    if (!isOpen || !cliente) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, [name]: formatCnpjCpf(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        // Envia o CNPJ apenas com os números para o backend
        const dataToSave = {
            ...formData,
            cnpj: formData.cnpj.replace(/\D/g, '')
        };
        onSave(cliente.id, dataToSave);
    };
    
    const handleDelete = () => {
        if (window.confirm(`Tem a certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
            onDelete(cliente.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Editar Cliente</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                    <button onClick={handleDelete} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700">Excluir</button>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">Guardar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
