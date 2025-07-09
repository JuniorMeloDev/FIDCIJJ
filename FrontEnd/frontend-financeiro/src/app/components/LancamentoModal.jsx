'use client';

import { useState } from 'react';
import { formatBRLInput, parseBRL } from '@/app/utils/formatters'; // Importa os formatadores

export default function LancamentoModal({ isOpen, onClose, onSave, contas, empresas }) {
    const [tipo, setTipo] = useState('DEBITO'); // DEBITO, CREDITO, TRANSFERENCIA
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [contaOrigem, setContaOrigem] = useState('');
    const [empresaAssociada, setEmpresaAssociada] = useState('');
    const [contaDestino, setContaDestino] = useState('');
    const [empresaDestino, setEmpresaDestino] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleLimpar = () => {
        setTipo('DEBITO');
        setData(new Date().toISOString().split('T')[0]);
        setDescricao('');
        setValor('');
        setContaOrigem('');
        setEmpresaAssociada('');
        setContaDestino('');
        setEmpresaDestino('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        // Validação para transferência
        if (tipo === 'TRANSFERENCIA' && contaOrigem === contaDestino) {
            setError('A conta de origem e destino não podem ser as mesmas.');
            setIsSaving(false);
            return;
        }

        const payload = {
            tipo,
            data,
            descricao,
            valor: parseBRL(valor), // Usa o parser para enviar o número correto
            contaOrigem,
            empresaAssociada,
            contaDestino: tipo === 'TRANSFERENCIA' ? contaDestino : null,
            empresaDestino: tipo === 'TRANSFERENCIA' ? empresaDestino : null,
        };
        
        const success = await onSave(payload);
        if (success) {
            handleLimpar();
            onClose();
        } else {
            setError('Falha ao salvar o lançamento. Verifique os dados e tente novamente.');
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Novo Lançamento Manual</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lançamento</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center"><input type="radio" name="tipo" value="DEBITO" checked={tipo === 'DEBITO'} onChange={(e) => setTipo(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300"/> <span className="ml-2 text-sm">Saída (Débito)</span></label>
                            <label className="flex items-center"><input type="radio" name="tipo" value="CREDITO" checked={tipo === 'CREDITO'} onChange={(e) => setTipo(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300"/> <span className="ml-2 text-sm">Entrada (Crédito)</span></label>
                            <label className="flex items-center"><input type="radio" name="tipo" value="TRANSFERENCIA" checked={tipo === 'TRANSFERENCIA'} onChange={(e) => setTipo(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300"/> <span className="ml-2 text-sm">Transferência</span></label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data</label>
                            <input type="date" id="data" value={data} onChange={e => setData(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                        <div>
                            <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor</label>
                            <input type="text" id="valor" value={valor} onChange={e => setValor(formatBRLInput(e.target.value))} required placeholder="R$ 0,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input type="text" id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="contaOrigem" className="block text-sm font-medium text-gray-700">{tipo === 'TRANSFERENCIA' ? 'Conta de Origem' : 'Conta'}</label>
                           <select id="contaOrigem" name="contaOrigem" value={contaOrigem} onChange={e => setContaOrigem(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Selecione...</option>
                                {contas.map(c => <option key={c.contaBancaria} value={c.contaBancaria}>{c.contaBancaria}</option>)}
                           </select>
                        </div>
                         <div>
                           <label htmlFor="empresaAssociada" className="block text-sm font-medium text-gray-700">{tipo === 'TRANSFERENCIA' ? 'Empresa de Origem' : 'Empresa'}</label>
                           <select id="empresaAssociada" name="empresaAssociada" value={empresaAssociada} onChange={e => setEmpresaAssociada(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Selecione...</option>
                                {empresas.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                    </div>
                    
                    {tipo === 'TRANSFERENCIA' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                             <div>
                                <label htmlFor="contaDestino" className="block text-sm font-medium text-gray-700">Conta de Destino</label>
                                <select id="contaDestino" name="contaDestino" value={contaDestino} onChange={e => setContaDestino(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                    <option value="">Selecione...</option>
                                    {contas.map(c => <option key={c.contaBancaria} value={c.contaBancaria}>{c.contaBancaria}</option>)}
                                </select>
                            </div>
                            <div>
                               <label htmlFor="empresaDestino" className="block text-sm font-medium text-gray-700">Empresa de Destino</label>
                               <select id="empresaDestino" name="empresaDestino" value={empresaDestino} onChange={e => setEmpresaDestino(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2">
                                    <option value="">Selecione...</option>
                                    {empresas.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isSaving ? 'A guardar...' : 'Guardar Lançamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};