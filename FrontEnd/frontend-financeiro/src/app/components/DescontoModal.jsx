'use client';

import { useState } from 'react';
// Importa as funções de formatação do ficheiro de utilitários
import { formatBRLInput, parseBRL } from '@/app/utils/formatters';

export default function DescontoModal({ isOpen, onClose, onSave }) {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');

    // Se o modal não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    const handleSaveClick = () => {
        // Validação simples para garantir que os campos não estão vazios
        if (!descricao || !valor) {
            alert('Por favor, preencha a descrição e o valor.');
            return;
        }
        // Envia o novo desconto para a página principal
        onSave({
            id: Date.now(), // Cria um ID temporário
            descricao,
            valor: parseBRL(valor), // Converte o valor formatado de volta para um número
        });
        // Limpa os campos e fecha o modal após guardar
        setDescricao('');
        setValor('');
        onClose();
    };

    return (
        // Fundo escuro do modal
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
            {/* Conteúdo do modal */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Adicionar Desconto / Taxa</h2>
                
                {/* Campo Descrição */}
                <div className="mb-4">
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input
                        type="text"
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                {/* Campo Valor */}
                <div className="mb-6">
                    <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor</label>
                    <input
                        type="text"
                        id="valor"
                        value={valor}
                        onChange={(e) => setValor(formatBRLInput(e.target.value))}
                        placeholder="R$ 0,00"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                        Voltar
                    </button>
                    <button onClick={handleSaveClick} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
