'use client';

import { useState, useEffect } from 'react';
import { formatCnpjCpf, formatTelefone, formatCep } from '@/app/utils/formatters';
import AutocompleteInput from './AutocompleteInput'; // Importa o componente de autocomplete

export default function EditClienteModal({ isOpen, onClose, cliente, onSave, onDelete, showNotification }) {
    const initialState = {
        nome: '', cnpj: '', ie: '', cep: '', endereco: '', bairro: '', municipio: '', uf: '', fone: '', contasBancarias: []
    };
    const [formData, setFormData] = useState(initialState);
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (cliente) {
                setFormData({ 
                    ...initialState,
                    ...cliente,
                    cnpj: cliente.cnpj ? formatCnpjCpf(cliente.cnpj) : '',
                    fone: cliente.fone ? formatTelefone(cliente.fone) : '',
                    cep: cliente.cep ? formatCep(cliente.cep) : '',
                    contasBancarias: cliente.contasBancarias ? [...cliente.contasBancarias] : []
                });
                setDataFetched(true);
            } else {
                setFormData(initialState);
                setDataFetched(false);
            }
        }
    }, [cliente, isOpen]);

    if (!isOpen) return null;

    const handleCnpjSearch = async (cnpjValue) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;
        setIsFetchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado ou inválido.');
            
            const data = await response.json();
            
            setFormData(prev => ({
                ...prev,
                nome: data.razao_social || '',
                fone: data.ddd_telefone_1 ? formatTelefone(`${data.ddd_telefone_1}${data.telefone_1 || ''}`) : '',
                cep: data.cep ? formatCep(data.cep) : '',
                endereco: `${data.logradouro || ''}, ${data.numero || ''}`,
                bairro: data.bairro || '',
                municipio: data.municipio || '',
                uf: data.uf || '',
                ie: '', 
            }));
            setDataFetched(true);

        } catch (error) {
            if(showNotification) showNotification(error.message, 'error');
            setDataFetched(true); 
        } finally {
            setIsFetchingCnpj(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'cnpj') {
            formattedValue = formatCnpjCpf(value);
            if (formattedValue.replace(/\D/g, '').length === 14) {
                handleCnpjSearch(formattedValue);
            }
        }
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    // Função para alterar qualquer campo de uma conta bancária
    const handleContaChange = (index, name, value) => {
        const contas = [...formData.contasBancarias];
        if (contas[index]) {
            contas[index][name] = value;
            setFormData(prev => ({ ...prev, contasBancarias: contas }));
        }
    };

    const addConta = () => {
        setFormData(prev => ({
            ...prev,
            contasBancarias: [...prev.contasBancarias, { banco: '', agencia: '', contaCorrente: '' }]
        }));
    };

    const removeConta = (index) => {
        const contas = [...formData.contasBancarias];
        contas.splice(index, 1);
        setFormData(prev => ({ ...prev, contasBancarias: contas }));
    };

    const handleSave = () => { 
        const dataToSave = { 
            ...formData, 
            cnpj: formData.cnpj.replace(/\D/g, ''), 
            fone: formData.fone?.replace(/\D/g, ''), 
            cep: formData.cep?.replace(/\D/g, ''),
        }; 
        onSave(cliente?.id, dataToSave); 
    };
    
    const isEditMode = !!cliente?.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
                
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600">CNPJ {isFetchingCnpj && <span className="text-xs text-indigo-500">(A consultar...)</span>}</label>
                            <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="Digite para buscar..." disabled={isEditMode} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Nome do Cliente</label>
                            <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/>
                        </div>
                    </div>

                    {dataFetched && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-xs font-bold text-gray-600">Inscrição Estadual</label><input type="text" name="ie" value={formData.ie || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                                <div><label className="block text-xs font-bold text-gray-600">Telefone</label><input type="text" name="fone" value={formData.fone || ''} onChange={(e) => setFormData(prev => ({...prev, fone: formatTelefone(e.target.value)}))} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                                <div><label className="block text-xs font-bold text-gray-600">CEP</label><input type="text" name="cep" value={formData.cep || ''} onChange={(e) => setFormData(prev => ({...prev, cep: formatCep(e.target.value)}))} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Endereço</label><input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                                <div><label className="block text-xs font-bold text-gray-600">Bairro</label><input type="text" name="bairro" value={formData.bairro || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Município</label><input type="text" name="municipio" value={formData.municipio || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                                <div><label className="block text-xs font-bold text-gray-600">UF</label><input type="text" name="uf" value={formData.uf || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/></div>
                            </div>
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-md font-semibold text-gray-800">Contas Bancárias</h3>
                                    <button type="button" onClick={addConta} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Adicionar</button>
                                </div>
                                <div className="space-y-2 max-h-28 overflow-y-auto pr-2 border rounded-md p-2">
                                    {formData.contasBancarias?.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 pr-2 text-center mb-1">
                                            <label className="block text-xs font-bold text-gray-500 col-span-2">Banco</label>
                                            <label className="block text-xs font-bold text-gray-500">Agência</label>
                                            <label className="block text-xs font-bold text-gray-500">C/C</label>
                                        </div>
                                    )}
                                    {formData.contasBancarias?.length > 0 ? formData.contasBancarias.map((conta, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                            <div className="col-span-2">
                                                <AutocompleteInput 
                                                    value={conta.banco}
                                                    onChange={(value) => handleContaChange(index, 'banco', value)}
                                                />
                                            </div>
                                            <input type="text" name="agencia" placeholder="Agência" value={conta.agencia || ''} onChange={e => handleContaChange(index, 'agencia', e.target.value)} className="border-gray-300 rounded-md p-1.5 text-sm" />
                                            <div className="flex items-center gap-1">
                                                <input type="text" name="contaCorrente" placeholder="Conta" value={conta.contaCorrente || ''} onChange={e => handleContaChange(index, 'contaCorrente', e.target.value)} className="border-gray-300 rounded-md p-1.5 text-sm w-full" />
                                                <button type="button" onClick={() => removeConta(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-gray-400 py-3">Nenhuma conta adicionada.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="mt-6 flex justify-between border-t pt-4">
                    <div>
                        {isEditMode && <button onClick={() => onDelete(cliente.id)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 text-sm">Excluir</button>}
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 text-sm">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}