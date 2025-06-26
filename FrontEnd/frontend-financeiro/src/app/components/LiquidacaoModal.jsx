'use client';

import { useState } from 'react';
import { formatBRLInput, parseBRL, formatBRLNumber } from '@/app/utils/formatters';


export default function LiquidacaoModal({ isOpen, onClose, onConfirm, duplicata }) {
    const [dataLiquidacao, setDataLiquidacao] = useState(new Date().toISOString().split('T')[0]);
    const [jurosMora, setJurosMora] = useState('');

    if (!isOpen) return null;

    const handleConfirmarCredito = () => {
        onConfirm(duplicata.id, dataLiquidacao, parseBRL(jurosMora));
        onClose();
    };

    const handleApenasBaixa = () => {
        onConfirm(duplicata.id, null, null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative border-8 bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Confirmar Liquidação</h2>
                <p className="mb-4 text-gray-700">
                    Você está a dar baixa na duplicata <span className="font-semibold">{duplicata?.nfCte}</span> no valor de <span className="font-semibold">{formatBRLNumber(duplicata?.valorBruto)}</span>.
                </p>
                
                <div className="mb-4 bg-gray-50 p-4 rounded-md space-y-4">
                    <div>
                        <label htmlFor="dataLiquidacao" className="block text-sm font-medium text-gray-700">Data do Crédito na Conta</label>
                        <input
                            type="date"
                            id="dataLiquidacao"
                            value={dataLiquidacao}
                            onChange={(e) => setDataLiquidacao(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                         <p className="text-xs text-gray-500 mt-1">Esta será a data de entrada do valor no fluxo de caixa.</p>
                    </div>
                    <div>
                        <label htmlFor="jurosMora" className="block text-sm font-medium text-gray-700">Juros / Mora (Opcional)</label>
                        <input
                            type="text"
                            id="jurosMora"
                            value={jurosMora}
                            onChange={(e) => setJurosMora(formatBRLInput(e.target.value))}
                            placeholder="R$ 0,00"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button onClick={handleApenasBaixa} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                        Apenas Dar Baixa (Sem Crédito)
                    </button>
                    <button onClick={handleConfirmarCredito} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700">
                        Confirmar e Creditar em Conta
                    </button>
                </div>
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
        </div>
    );
}
