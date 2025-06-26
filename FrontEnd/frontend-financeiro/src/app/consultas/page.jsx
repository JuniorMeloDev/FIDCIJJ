'use client';

import { useState, useEffect } from 'react';
import Notification from '@/app/components/Notification';
import LiquidacaoModal from '@/app/components/LiquidacaoModal';
import { formatBRLNumber } from '@/app/utils/formatters';

export default function ConsultasPage() {
    const [duplicatas, setDuplicatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(null);
    const [liquidandoId, setLiquidandoId] = useState(null);
    const [estornandoId, setEstornandoId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [duplicataParaLiquidar, setDuplicataParaLiquidar] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchDuplicatas = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/duplicatas');
            if (!response.ok) {
                throw new Error('Falha ao buscar os dados da API.');
            }
            const data = await response.json();
            setDuplicatas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDuplicatas();
    }, []);

    // Função que abre o modal, passando os dados da duplicata selecionada
    const handleAbrirModalLiquidacao = (duplicata) => {
        setDuplicataParaLiquidar(duplicata);
        setIsModalOpen(true);
    };

    // Função chamada pelo modal para efetuar a liquidação
    const handleConfirmarLiquidacao = async (duplicataId, dataLiquidacao, jurosMora) => {
        setLiquidandoId(duplicataId);
        let url = `http://localhost:8080/api/duplicatas/${duplicataId}/liquidar`;
        
        const params = new URLSearchParams();
        if (dataLiquidacao) {
            params.append('dataLiquidacao', dataLiquidacao);
        }
        if (jurosMora && jurosMora > 0) {
            params.append('jurosMora', jurosMora);
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        try {
            const response = await fetch(url, { method: 'POST' });
            if (!response.ok) {
                throw new Error('Falha ao dar baixa na duplicata.');
            }
            setDuplicatas(duplicatas.map(d => 
                d.id === duplicataId ? { ...d, statusRecebimento: 'Recebido' } : d
            ));
            showNotification('Duplicata liquidada com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setLiquidandoId(null);
        }
    };

    const handleEstornar = async (duplicataId) => {
        if (!window.confirm("Tem a certeza que deseja estornar esta liquidação? A movimentação de caixa correspondente (se existir) será excluída.")) {
            return;
        }
        setEstornandoId(duplicataId);
        try {
            const response = await fetch(`http://localhost:8080/api/duplicatas/${duplicataId}/estornar`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Falha ao estornar a liquidação.');
            }
            setDuplicatas(duplicatas.map(d => 
                d.id === duplicataId ? { ...d, statusRecebimento: 'Pendente' } : d
            ));
            showNotification('Liquidação estornada com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setEstornandoId(null);
        }
    };

    const handleGeneratePdf = async (operacaoId) => {
        if (!operacaoId) {
            alert("Esta duplicata não está associada a uma operação para gerar PDF.");
            return;
        }
        setPdfLoading(operacaoId);
        try {
            const response = await fetch(`http://localhost:8080/api/operacoes/${operacaoId}/pdf`);
            if (!response.ok) throw new Error('Não foi possível gerar o PDF.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bordero-${operacaoId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.message);
        } finally {
            setPdfLoading(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    if (loading) return <div className="text-center p-10">A carregar dados...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Erro: {error}</div>;

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            {/* Renderiza o componente do modal */}
            <LiquidacaoModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmarLiquidacao}
                duplicata={duplicataParaLiquidar}
            />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Consulta de Duplicatas Operadas</h1>
                    <p className="text-lg text-gray-600 mt-1">Histórico completo de todas as duplicatas processadas.</p>
                </header>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recebido</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Op.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NF/CT-e</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sacado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Bruto</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Juros</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Venc.</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {duplicatas.map((dup) => (
                                    <tr key={dup.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={dup.statusRecebimento === 'Recebido'}
                                                    disabled={dup.statusRecebimento === 'Recebido' || liquidandoId === dup.id}
                                                    onChange={() => handleAbrirModalLiquidacao(dup)}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded disabled:opacity-50"
                                                />
                                                {dup.statusRecebimento === 'Recebido' && (
                                                    <button 
                                                        onClick={() => handleEstornar(dup.id)} 
                                                        disabled={estornandoId === dup.id}
                                                        className="text-gray-400 hover:text-blue-600 disabled:text-gray-300"
                                                        title="Estornar Liquidação"
                                                    >
                                                        {estornandoId === dup.id ? '...' : '↩'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(dup.dataOperacao)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dup.nfCte}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dup.clienteSacado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatBRLNumber(dup.valorBruto)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">{formatBRLNumber(dup.valorJuros)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(dup.dataVencimento)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                            <button 
                                                onClick={() => handleGeneratePdf(dup.operacaoId)} 
                                                disabled={pdfLoading === dup.operacaoId || !dup.operacaoId}
                                                className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-wait"
                                            >
                                                {pdfLoading === dup.operacaoId ? 'A gerar...' : 'Gerar PDF'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {duplicatas.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-gray-500">Nenhuma duplicata encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}

