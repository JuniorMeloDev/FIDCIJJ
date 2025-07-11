'use client';

import { useState, useEffect } from 'react';
import { formatCnpjCpf, formatTelefone, formatCep } from '@/app/utils/formatters';

// Esta função de formatação pode ser mantida ou ajustada conforme a sua necessidade
const formatTaxaInput = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/[^\d,]/g, '');
    return cleanValue;
};

// Função para converter a string formatada de volta para um número
const parseTaxa = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(',', '.'));
}

export default function EditSacadoModal({ isOpen, onClose, sacado, onSave, onDelete, showNotification, tiposOperacao }) {
    const initialState = {
        nome: '', cnpj: '', ie: '', cep: '', endereco: '', bairro: '', municipio: '', uf: '', fone: '', condicoesPagamento: []
    };
    const [formData, setFormData] = useState(initialState);
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (sacado) {
                const formattedCondicoes = sacado.condicoesPagamento ? sacado.condicoesPagamento.map(c => ({
                    ...c,
                    taxaJuros: c.taxaJuros ? String(c.taxaJuros).replace('.', ',') : '',
                    // Garante que estamos a usar o ID para o valor do select
                    tipoOperacaoId: c.tipoOperacao?.id || c.tipoOperacaoId
                })) : [];

                setFormData({ 
                    ...initialState,
                    ...sacado,
                    cnpj: sacado.cnpj ? formatCnpjCpf(sacado.cnpj) : '',
                    fone: sacado.fone ? formatTelefone(sacado.fone) : '',
                    cep: sacado.cep ? formatCep(sacado.cep) : '',
                    condicoesPagamento: formattedCondicoes
                });
                setDataFetched(true);
            } else {
                setFormData(initialState);
                setDataFetched(false);
            }
        }
    }, [sacado, isOpen]);

    if (!isOpen) return null;

    const handleCnpjSearch = async (cnpjValue) => {
        const cleanCnpj = cnpjValue.replace(/\D/g, '');
        if (cleanCnpj.length !== 14) return;
        setIsFetchingCnpj(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('CNPJ não encontrado na base de dados externa.');
            
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

    const handleCondicaoChange = (index, e) => {
        const { name, value } = e.target;
        const condicoes = [...formData.condicoesPagamento];

        if (condicoes[index]) {
            let finalValue = value;
            if (name === 'taxaJuros') {
                finalValue = formatTaxaInput(value);
            }
            condicoes[index][name] = finalValue;

            if (name === 'tipoOperacaoId') {
                const tipoSelecionado = tiposOperacao.find(op => op.id === parseInt(value));
                if (tipoSelecionado && tipoSelecionado.taxaJuros) {
                    condicoes[index]['taxaJuros'] = String(tipoSelecionado.taxaJuros).replace('.', ',');
                } else {
                    condicoes[index]['taxaJuros'] = '';
                }
            }

            setFormData(prev => ({ ...prev, condicoesPagamento: condicoes }));
        }
    };

    const addCondicao = () => {
        const defaultTipoId = tiposOperacao && tiposOperacao.length > 0 ? tiposOperacao[0].id : '';
        const tipoSelecionado = tiposOperacao.find(op => op.id === defaultTipoId);
        const taxaPadrao = tipoSelecionado && tipoSelecionado.taxaJuros ? String(tipoSelecionado.taxaJuros).replace('.', ',') : '';
        
        setFormData(prev => ({
            ...prev,
            condicoesPagamento: [...prev.condicoesPagamento, { tipoOperacaoId: defaultTipoId, taxaJuros: taxaPadrao, prazos: '' }]
        }));
    };

    const removeCondicao = (index) => {
        const condicoes = [...formData.condicoesPagamento];
        condicoes.splice(index, 1);
        setFormData(prev => ({ ...prev, condicoesPagamento: condicoes }));
    };

    const handleSave = () => { 
        const dataToSave = { 
            ...formData, 
            cnpj: formData.cnpj.replace(/\D/g, ''), 
            fone: formData.fone?.replace(/\D/g, ''), 
            cep: formData.cep?.replace(/\D/g, ''),
            condicoesPagamento: formData.condicoesPagamento.map(c => ({
                ...c,
                taxaJuros: parseTaxa(c.taxaJuros)
            }))
        }; 
        onSave(sacado?.id, dataToSave); 
    };
    
    const isEditMode = !!sacado?.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Editar Sacado' : 'Adicionar Novo Sacado'}</h2>
                
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600">CNPJ {isFetchingCnpj && <span className="text-xs text-indigo-500">(A consultar...)</span>}</label>
                            <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="Digite para buscar..." disabled={isEditMode} className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 text-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600">Nome do Sacado</label>
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
                                    <h3 className="text-md font-semibold text-gray-800">Condições de Pagamento</h3>
                                    <button type="button" onClick={addCondicao} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Adicionar</button>
                                </div>
                                <div className="space-y-2 max-h-28 overflow-y-auto pr-2 border rounded-md p-2">
                                    {formData.condicoesPagamento?.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 pr-12 text-center mb-1">
                                            <label className="block text-xs font-bold text-gray-500">Tipo de Operação</label>
                                            <label className="block text-xs font-bold text-gray-500">Taxa (%)</label>
                                            <label className="block text-xs font-bold text-gray-500">Prazos</label>
                                        </div>
                                    )}
                                    {formData.condicoesPagamento?.length > 0 ? formData.condicoesPagamento.map((cond, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                            <select name="tipoOperacaoId" value={cond.tipoOperacaoId || ''} onChange={e => handleCondicaoChange(index, e)} className="border-gray-300 rounded-md p-1.5 text-sm">
                                                <option value="">Selecione...</option>
                                                {tiposOperacao.map(op => (
                                                    <option key={op.id} value={op.id}>{op.nome}</option>
                                                ))}
                                            </select>
                                            <input type="text" name="taxaJuros" placeholder="0,00" value={cond.taxaJuros || ''} onChange={e => handleCondicaoChange(index, e)} className="border-gray-300 rounded-md p-1.5 text-sm text-right" />
                                            <input type="text" name="prazos" placeholder="ex: 15/30" value={cond.prazos || ''} onChange={e => handleCondicaoChange(index, e)} className="border-gray-300 rounded-md p-1.5 text-sm" />
                                            <button type="button" onClick={() => removeCondicao(index)} className="bg-red-100 text-red-700 text-xs font-semibold py-1.5 px-2 rounded-md hover:bg-red-200">Remover</button>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-gray-400 py-3">Nenhuma condição adicionada.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="mt-6 flex justify-between border-t pt-4">
                    <div>
                        {isEditMode && <button onClick={() => onDelete(sacado.id)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 text-sm">Excluir</button>}
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