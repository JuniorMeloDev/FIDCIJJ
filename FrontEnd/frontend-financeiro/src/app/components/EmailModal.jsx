'use client';

import { useState, useEffect } from 'react';

export default function ConfirmEmailModal({ isOpen, onClose, onSend, isSending, tipoOperacao }) {
    const [recipients, setRecipients] = useState([]);
    const [newEmail, setNewEmail] = useState('');

    // Lista de e-mails predefinidos que você forneceu
    const predefinidos = {
        'IJJ': ['eliane.rolim@exemplo.com', 'financeiro@exemplo.com', 'joao.pinto@exemplo.com'],
        'IJJ_TRANSREC': ['eliane.rolim@exemplo.com', 'financeiro@exemplo.com', 'joao.pinto@exemplo.com'],
        'A_VISTA': [] // Sem e-mails predefinidos para A VISTA
    };

    // Este `useEffect` é executado sempre que o modal abre
    useEffect(() => {
        if (isOpen) {
            // Define a lista de destinatários com base no tipo de operação
            setRecipients(predefinidos[tipoOperacao] || []);
        }
    }, [isOpen, tipoOperacao]);

    if (!isOpen) return null;

    const handleAddEmail = () => {
        // Validação simples de e-mail e verifica se já não existe na lista
        if (newEmail && newEmail.includes('@') && !recipients.includes(newEmail)) {
            setRecipients([...recipients, newEmail]);
            setNewEmail(''); // Limpa o campo de input
        }
    };

    const handleRemoveEmail = (emailToRemove) => {
        setRecipients(recipients.filter(email => email !== emailToRemove));
    };

    const handleSend = () => {
        if (recipients.length === 0) {
            alert("Por favor, adicione pelo menos um destinatário.");
            return;
        }
        onSend(recipients);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
                <h2 className="text-2xl font-bold mb-4">Enviar E-mail de Notificação?</h2>
                <p className="mb-4 text-gray-600">O borderô foi guardado. Deseja enviar o PDF por e-mail para os destinatários abaixo?</p>
                
                <div className="bg-gray-50 p-4 rounded-md">
                    <label className="block text-sm font-medium text-gray-700">Destinatários</label>
                    
                    {/* Lista de e-mails como "tags" */}
                    <div className="mt-2 flex flex-wrap gap-2 mb-4">
                        {recipients.map(email => (
                            <span key={email} className="flex items-center gap-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                {email}
                                <button onClick={() => handleRemoveEmail(email)} className="text-indigo-500 hover:text-indigo-700 font-bold text-lg leading-none">&times;</button>
                            </span>
                        ))}
                    </div>

                    {/* Input para adicionar novo e-mail */}
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Adicionar outro e-mail"
                            className="flex-grow border-gray-300 rounded-md shadow-sm"
                        />
                        <button type="button" onClick={handleAddEmail} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                            Adicionar
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} disabled={isSending} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50">
                        Não, Obrigado
                    </button>
                    <button onClick={handleSend} disabled={isSending || recipients.length === 0} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50">
                        {isSending ? 'A enviar...' : 'Sim, Enviar E-mail'}
                    </button>
                </div>
            </div>
        </div>
    );
}
