'use client';

import { useState, useEffect } from 'react';
import { formatCnpjCpf, formatTelefone, formatCep } from '@/app/utils/formatters';

export default function EditSacadoModal({ isOpen, onClose, sacado, onSave, onDelete }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (sacado) {
            setFormData({ 
                ...sacado,
                cnpj: sacado.cnpj ? formatCnpjCpf(sacado.cnpj) : '',
                fone: sacado.fone ? formatTelefone(sacado.fone) : '',
                cep: sacado.cep ? formatCep(sacado.cep) : '',
            });
        }
    }, [sacado]);

    if (!isOpen || !sacado) return null;

    const handleCepSearch = async (cepValue) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.erro) return;
            setFormData(prev => ({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cnpj') formattedValue = formatCnpjCpf(value);
        else if (name === 'fone') formattedValue = formatTelefone(value);
        else if (name === 'cep') {
            formattedValue = formatCep(value);
            handleCepSearch(formattedValue);
        }
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSave = () => {
        const dataToSave = {
            ...formData,
            cnpj: formData.cnpj.replace(/\D/g, ''),
            fone: formData.fone.replace(/\D/g, ''),
            cep: formData.cep.replace(/\D/g, ''),
        };
        onSave(sacado.id, dataToSave);
    };

    const handleDelete = () => {
        if (window.confirm(`Tem a certeza que deseja excluir o sacado "${sacado.nome}"?`)) {
            onDelete(sacado.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-6">Editar Sacado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <input type="text" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="ie" className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                        <input type="text" name="ie" value={formData.ie || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                        <input type="text" name="cep" value={formData.cep || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="fone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="text" name="fone" value={formData.fone || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">Bairro/Distrito</label>
                        <input type="text" name="bairro" value={formData.bairro || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                     <div>
                        <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Município</label>
                        <input type="text" name="municipio" value={formData.municipio || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="uf" className="block text-sm font-medium text-gray-700">UF</label>
                        <input type="text" name="uf" value={formData.uf || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div className="mt-8 flex justify-between">
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