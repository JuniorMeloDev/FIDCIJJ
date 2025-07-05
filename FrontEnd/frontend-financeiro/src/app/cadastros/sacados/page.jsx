'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditSacadoModal from '@/app/components/EditSacadoModal';
import Notification from '@/app/components/Notification';
import { formatCnpjCpf, formatTelefone, formatCep } from '@/app/utils/formatters';
import Pagination from '@/app/components/Pagination';

const ITEMS_PER_PAGE = 20;
const API_URL = 'http://localhost:8080/api/cadastros';

export default function SacadosPage() {
    const [sacados, setSacados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSacado, setNewSacado] = useState({
        nome: '', cnpj: '', ie: '', cep: '', endereco: '', bairro: '', municipio: '', uf: '', fone: ''
    });

    const [editingSacado, setEditingSacado] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

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

    const handleCepSearch = async (cepValue) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.erro) return;

            setNewSacado(prev => ({
                ...prev,
                endereco: data.logradouro,
                bairro: data.bairro,
                municipio: data.localidade,
                uf: data.uf
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        if (name === 'cnpj') formattedValue = formatCnpjCpf(value);
        else if (name === 'fone') formattedValue = formatTelefone(value);
        else if (name === 'cep') {
            formattedValue = formatCep(value);
            handleCepSearch(formattedValue);
        }
        
        setNewSacado(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newSacado,
                cnpj: newSacado.cnpj.replace(/\D/g, ''),
                fone: newSacado.fone.replace(/\D/g, ''),
                cep: newSacado.cep.replace(/\D/g, ''),
            };
            const response = await fetch(`${API_URL}/sacados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Falha ao criar sacado.');
            
            setNewSacado({ nome: '', cnpj: '', ie: '', cep: '', endereco: '', bairro: '', municipio: '', uf: '', fone: '' });
            setShowForm(false);
            await fetchSacados();
            showNotification('Sacado criado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSacado = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/sacados/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Falha ao atualizar o sacado.');
            
            setEditingSacado(null);
            await fetchSacados();
            showNotification('Sacado atualizado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleDeleteSacado = async (id) => {
        try {
            const response = await fetch(`${API_URL}/sacados/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Falha ao excluir o sacado.');
            
            setEditingSacado(null);
            setSacados(sacados.filter(s => s.id !== id));
            showNotification('Sacado excluído com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const currentItems = sacados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <EditSacadoModal
                isOpen={!!editingSacado}
                onClose={() => setEditingSacado(null)}
                sacado={editingSacado}
                onSave={handleUpdateSacado}
                onDelete={handleDeleteSacado}
            />
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cadastros</h1>
                <p className="text-sm text-gray-600 mt-1">Gestão de Clientes e Sacados</p>
            </header>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <Link href="/cadastros/clientes" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Clientes (Cedentes)
                    </Link>
                    <Link href="/cadastros/sacados" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Sacados (Devedores)
                    </Link>
                </nav>
            </div>

            <div className="mb-8">
                {!showForm ? (
                    <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">
                        + Adicionar Sacado Manualmente
                    </button>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Sacado</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                             <div className="md:col-span-2">
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                                <input type="text" name="nome" value={newSacado.nome} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ / CPF</label>
                                <input type="text" name="cnpj" value={newSacado.cnpj} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label htmlFor="ie" className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                                <input type="text" name="ie" value={newSacado.ie} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                                <input type="text" name="cep" value={newSacado.cep} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label htmlFor="fone" className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input type="text" name="fone" value={newSacado.fone} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                                <input type="text" name="endereco" value={newSacado.endereco} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro/Distrito</label>
                                <input type="text" name="bairro" value={newSacado.bairro} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Município</label>
                                <input type="text" name="municipio" value={newSacado.municipio} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="uf" className="block text-sm font-medium text-gray-700">UF</label>
                                <input type="text" name="uf" value={newSacado.uf} onChange={handleInputChange} maxLength="2" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
                                    {isSubmitting ? 'A guardar...' : 'Guardar Sacado'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Sacados Registados</h2>
                <div className="overflow-x-auto">
                    {loading && <p className="text-center py-4">A carregar...</p>}
                    {error && <p className="text-center py-4 text-red-500">{error}</p>}
                    {!loading && !error && (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Município</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((sacado) => (
                                    <tr key={sacado.id} onClick={() => setEditingSacado(sacado)} className="hover:bg-gray-100 cursor-pointer">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{sacado.nome}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{formatCnpjCpf(sacado.cnpj)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{sacado.municipio} - {sacado.uf}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{formatTelefone(sacado.fone)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Pagination totalItems={sacados.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                </div>
            </div>
        </main>
    );
}