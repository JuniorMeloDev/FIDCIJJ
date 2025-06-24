'use client';

import { useState } from 'react';
import { formatBRLInput, parseBRL } from '@/app/utils/formatters';
import Notification from '@/app/components/Notification';

const API_URL = 'http://localhost:8080/api';

export default function LancamentosPage() {
    const [tipo, setTipo] = useState('DEBITO');
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [contaOrigem, setContaOrigem] = useState('');
    const [contaDestino, setContaDestino] = useState('');
    const [empresaAssociada, setEmpresaAssociada] = useState('');
    const [empresaDestino, setEmpresaDestino] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const contas = ["Itaú", "Inter", "BNB", "Safra"];
    const empresas = ["Recife", "Transrec", "PE"];

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const handleLimpar = () => {
        setTipo('DEBITO');
        setData(new Date().toISOString().split('T')[0]);
        setDescricao('');
        setValor('');
        setContaOrigem('');
        setContaDestino('');
        setEmpresaAssociada('');
        setEmpresaDestino('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            tipo,
            data,
            descricao,
            valor: parseBRL(valor),
            contaOrigem,
            empresaAssociada,
            contaDestino: tipo === 'TRANSFERENCIA' ? contaDestino : null,
            empresaDestino: tipo === 'TRANSFERENCIA' ? empresaDestino : null,
        };

        try {
            const response = await fetch(`${API_URL}/lancamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Falha ao criar o lançamento.');
            }
            
            showNotification('Lançamento criado com sucesso!', 'success');
            handleLimpar();

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Notification 
                message={notification.message} 
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            <main className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Criar Lançamento Avulso</h1>
                    <p className="text-lg text-gray-600 mt-1">Registe débitos, créditos ou transferências entre contas.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lançamento</label>
                        <div className="flex space-x-4">
                            {['DEBITO', 'CREDITO', 'TRANSFERENCIA'].map(t => (
                                <label key={t} className="flex items-center">
                                    <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={(e) => setTipo(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300"/>
                                    <span className="ml-2 text-sm text-gray-700">{t.charAt(0) + t.slice(1).toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data</label>
                            <input type="date" id="data" value={data} onChange={e => setData(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor</label>
                            <input type="text" id="valor" value={valor} onChange={e => setValor(formatBRLInput(e.target.value))} required placeholder="R$ 0,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input type="text" id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label htmlFor="contaOrigem" className="block text-sm font-medium text-gray-700">{tipo === 'TRANSFERENCIA' ? 'Conta de Origem' : 'Conta'}</label>
                           <select id="contaOrigem" value={contaOrigem} onChange={e => setContaOrigem(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">Selecione...</option>
                                {contas.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                         <div>
                           <label htmlFor="empresaAssociada" className="block text-sm font-medium text-gray-700">{tipo === 'TRANSFERENCIA' ? 'Empresa de Origem' : 'Empresa'}</label>
                           <select id="empresaAssociada" value={empresaAssociada} onChange={e => setEmpresaAssociada(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">Selecione...</option>
                                {empresas.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                    </div>
                    
                    {tipo === 'TRANSFERENCIA' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                             <div>
                                <label htmlFor="contaDestino" className="block text-sm font-medium text-gray-700">Conta de Destino</label>
                                <select id="contaDestino" value={contaDestino} onChange={e => setContaDestino(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="">Selecione...</option>
                                    {contas.filter(c => c !== contaOrigem).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                               <label htmlFor="empresaDestino" className="block text-sm font-medium text-gray-700">Empresa de Destino</label>
                               <select id="empresaDestino" value={empresaDestino} onChange={e => setEmpresaDestino(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="">Selecione...</option>
                                    {empresas.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleLimpar} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md hover:bg-gray-300">Limpar</button>
                        <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isSaving ? 'Salvando...' : 'Salvar Lançamento'}
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}
