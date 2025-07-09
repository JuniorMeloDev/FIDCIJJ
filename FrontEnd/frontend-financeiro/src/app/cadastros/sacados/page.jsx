'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditSacadoModal from '@/app/components/EditSacadoModal';
import Notification from '@/app/components/Notification';
import ConfirmacaoModal from '@/app/components/ConfirmacaoModal'; // Importa o novo modal de confirmação
import { formatCnpjCpf, formatTelefone } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api/cadastros';

export default function SacadosPage() {
    const [sacados, setSacados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSacado, setEditingSacado] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [sacadoParaExcluir, setSacadoParaExcluir] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchSacados = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/sacados`);
            if (!response.ok) throw new Error('Falha ao carregar sacados.');
            const data = await response.json();
            setSacados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSacados();
    }, []);

    const handleOpenAddModal = () => {
        setEditingSacado(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (sacado) => {
        setEditingSacado(sacado);
        setIsModalOpen(true);
    };

    const handleSaveSacado = async (id, data) => {
        const isUpdating = !!id;
        const url = isUpdating ? `${API_URL}/sacados/${id}` : `${API_URL}/sacados`;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const payload = {
                ...data,
                cnpj: data.cnpj.replace(/\D/g, ''),
                fone: data.fone?.replace(/\D/g, ''),
                cep: data.cep?.replace(/\D/g, ''),
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao salvar o sacado.');
            }

            setIsModalOpen(false);
            await fetchSacados();
            showNotification(`Sacado ${isUpdating ? 'atualizado' : 'criado'} com sucesso!`, 'success');

        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleDeleteRequest = (id) => {
        const sacado = sacados.find(s => s.id === id);
        setSacadoParaExcluir(sacado);
    };

    const handleConfirmarExclusao = async () => {
        if (!sacadoParaExcluir) return;

        try {
            const response = await fetch(`${API_URL}/sacados/${sacadoParaExcluir.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Falha ao excluir o sacado.');
            }
            
            showNotification('Sacado excluído com sucesso!', 'success');
            await fetchSacados();
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setSacadoParaExcluir(null);
            setIsModalOpen(false);
        }
    };

    return (
        <main className="p-4 sm:p-6 flex flex-col h-full">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            
            <EditSacadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sacado={editingSacado}
                onSave={handleSaveSacado}
                onDelete={handleDeleteRequest}
                showNotification={showNotification}
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
                    <Link href="/cadastros/clientes" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Clientes (Cedentes)
                    </Link>
                    <Link href="/cadastros/sacados" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Sacados (Devedores)
                    </Link>
                </nav>
            </div>

            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleOpenAddModal} 
                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700"
                >
                    Novo Sacado
                </button>
            </div>

            <div className="flex-grow bg-white p-4 rounded-lg shadow-md">
                <div className="overflow-auto">
                    {loading ? <p>A carregar...</p> : error ? <p className="text-red-500">{error}</p> : (
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
                                {sacados.map((sacado) => (
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
            </div>
        </main>
    );
}