'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Notification from '@/app/components/Notification';
import LiquidacaoModal from '@/app/components/LiquidacaoModal';
import ConfirmacaoEstornoModal from '@/app/components/ConfirmacaoEstornoModal';
import { formatBRLNumber, formatDate } from '@/app/utils/formatters';
import ConfirmEmailModal from '@/app/components/EmailModal';
import Pagination from '@/app/components/Pagination';
import FiltroLateralConsultas from '@/app/components/FiltroLateralConsultas'; 

const ITEMS_PER_PAGE = 7;

export default function ConsultasPage() {
    const [duplicatas, setDuplicatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [contasMaster, setContasMaster] = useState([]);
    
    const [filters, setFilters] = useState({
        dataOpInicio: '', dataOpFim: '',
        dataVencInicio: '', dataVencFim: '',
        sacado: '', nfCte: '', status: 'Todos'
    });

    const [pdfLoading, setPdfLoading] = useState(null);
    const [estornandoId, setEstornandoId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLiquidarModalOpen, setIsLiquidarModalOpen] = useState(false);
    const [duplicataParaLiquidar, setDuplicataParaLiquidar] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [operacaoParaEmail, setOperacaoParaEmail] = useState(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);
    const [estornoInfo, setEstornoInfo] = useState(null);

    // Lógica para buscar os dados com base nos filtros
    const fetchDuplicatas = async (currentFilters) => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'Todos') {
                params.append(key, value);
            }
        });
        
        try {
            const response = await fetch(`http://localhost:8080/api/duplicatas?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao buscar os dados da API.');
            const data = await response.json();
            setDuplicatas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Este useEffect agora busca os dados iniciais assim que a página carrega
    useEffect(() => {
        // Função para buscar as contas, que agora vive dentro deste useEffect
        const fetchContasMaster = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/cadastros/contas/master"); // Corrigido endpoint
                if (!res.ok) throw new Error("Falha ao buscar contas master.");
                const contas = await res.json();
                setContasMaster(contas);
            } catch (error) {
                console.error(error);
                // Opcional: notificar o usuário sobre o erro
                showNotification('Não foi possível carregar as contas bancárias.', 'error');
            }
        };

        // Chama as duas funções de busca
        fetchDuplicatas(filters);
        fetchContasMaster();
    }, []); // O array vazio [] garante que isso só rode uma vez

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const applyFilters = () => {
        setCurrentPage(1);
        fetchDuplicatas(filters);
    };

    const clearFilters = () => {
        const cleared = { dataOpInicio: '', dataOpFim: '', dataVencInicio: '', dataVencFim: '', sacado: '', nfCte: '', status: 'Todos' };
        setFilters(cleared);
        setCurrentPage(1);
        fetchDuplicatas(cleared); // Busca os dados com os filtros limpos
    };

    // ... (resto das suas funções handle, como handleEstornar, etc., continuam aqui sem alteração)
    useEffect(() => {const handleClickOutside = (event) => {if (menuRef.current && !menuRef.current.contains(event.target)) {setOpenMenuId(null);}}; document.addEventListener("mousedown", handleClickOutside); return () => {document.removeEventListener("mousedown", handleClickOutside);};}, []);
    const showNotification = (message, type) => { setNotification({ message, type }); setTimeout(() => setNotification({ message: '', type: '' }), 5000); };
    const handleAbrirModalLiquidacao = (duplicata) => { setDuplicataParaLiquidar(duplicata); setIsLiquidarModalOpen(true); setOpenMenuId(null); };
    const handleConfirmarLiquidacao = async (duplicataId, dataLiquidacao, jurosMora, contaBancariaId) => {
        let url = `http://localhost:8080/api/duplicatas/${duplicataId}/liquidar`;
        const params = new URLSearchParams();
        if (dataLiquidacao) params.append('dataLiquidacao', dataLiquidacao);
        if (jurosMora && jurosMora > 0) params.append('jurosMora', jurosMora);
        if(contaBancariaId) params.append('contaBancariaId', contaBancariaId); // Adiciona o ID da conta
    
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
    
        try {
            const response = await fetch(url, { method: 'POST' });
            if (!response.ok) throw new Error('Falha ao dar baixa na duplicata.');
            const duplicataAtualizada = await response.json();
            setDuplicatas(duplicatas.map(d => d.id === duplicataAtualizada.id ? duplicataAtualizada : d));
            showNotification('Duplicata liquidada com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsLiquidarModalOpen(false);
        }
    };
    const handleEstornar = (duplicataId) => { setOpenMenuId(null); setEstornoInfo({ id: duplicataId }); };
    const confirmarEstorno = async () => { if (!estornoInfo) return; setEstornandoId(estornoInfo.id); try { const response = await fetch(`http://localhost:8080/api/duplicatas/${estornoInfo.id}/estornar`, { method: 'POST' }); if (!response.ok) { const errorData = await response.text(); throw new Error(errorData || 'Falha ao estornar a liquidação.'); } setDuplicatas(duplicatas.map(d => d.id === estornoInfo.id ? { ...d, statusRecebimento: 'Pendente', dataLiquidacao: null, contaLiquidacao: null } : d)); showNotification('Liquidação estornada com sucesso!', 'success'); } catch (err) { showNotification(err.message, 'error'); } finally { setEstornandoId(null); setEstornoInfo(null); } };
    const handleAbrirEmailModal = (operacaoId, tipoOperacao) => { setOperacaoParaEmail({ id: operacaoId, tipoOperacao: tipoOperacao }); setIsEmailModalOpen(true); setOpenMenuId(null); };
    const handleSendEmail = async (destinatarios) => { if (!operacaoParaEmail) return; setIsSendingEmail(true); try { const response = await fetch(`http://localhost:8080/api/operacoes/${operacaoParaEmail.id}/enviar-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destinatarios }), }); if (!response.ok) throw new Error("Falha ao enviar o e-mail."); showNotification("E-mail(s) enviado(s) com sucesso!", "success"); } catch (err) { showNotification(err.message, "error"); } finally { setIsSendingEmail(false); setIsEmailModalOpen(false); } };
    const handleGeneratePdf = async (operacaoId) => { setOpenMenuId(null); if (!operacaoId) { alert("Esta duplicata não está associada a uma operação para gerar PDF."); return; } setPdfLoading(operacaoId); try { const response = await fetch(`http://localhost:8080/api/operacoes/${operacaoId}/pdf`); if (!response.ok) throw new Error('Não foi possível gerar o PDF.'); const contentDisposition = response.headers.get('content-disposition'); let filename = `bordero-${operacaoId}.pdf`; if (contentDisposition) { const filenameMatch = contentDisposition.match(/filename="([^"]+)"/); if (filenameMatch && filenameMatch.length > 1) { filename = filenameMatch[1].replace(/[^a-zA-Z0-9.,\s-]/g, '').trim(); } } const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); } catch (err) { alert(err.message); } finally { setPdfLoading(null); } };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = duplicatas.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="text-center p-10">A carregar...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Erro: {error}</div>;

    
    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <ConfirmacaoEstornoModal isOpen={!!estornoInfo} onClose={() => setEstornoInfo(null)} onConfirm={confirmarEstorno} title="Confirmar Estorno" message="Tem a certeza que deseja estornar esta liquidação? A movimentação de caixa correspondente (se existir) será excluída." />
            <LiquidacaoModal
                isOpen={isLiquidarModalOpen}
                onClose={() => setIsLiquidarModalOpen(false)}
                onConfirm={handleConfirmarLiquidacao}
                duplicata={duplicataParaLiquidar}
                contasMaster={contasMaster}
            />
            <ConfirmEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSend={handleSendEmail} isSending={isSendingEmail} tipoOperacao={operacaoParaEmail?.tipoOperacao} />

            <main className="p-4 sm:p-6 flex flex-col h-full">
                <header className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Consulta de Duplicatas Operadas</h1>
                    <p className="text-sm text-gray-600">Histórico completo de todas as duplicatas processadas.</p>
                </header>

                <div className="flex-grow flex flex-col lg:flex-row gap-6">
                    <FiltroLateralConsultas
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApply={applyFilters}
                        onClear={clearFilters}
                    />
                    <div className="flex-grow bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <div className="overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                               <thead className="bg-gray-50">
                                    <tr>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Op.</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NF/CT-e</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sacado</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor Bruto</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Juros</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Venc.</th>
                                        <th className="sticky top-0 bg-gray-50 z-10 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((dup) => {
                                        const isLiquidado = dup.statusRecebimento === 'Recebido';
                                        const opacidade = isLiquidado ? 'opacity-50' : '';

                                        return (
                                            <tr key={dup.id} className={`group relative hover:bg-gray-50`}>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-600 ${opacidade}`}>{formatDate(dup.dataOperacao)}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 ${opacidade}`}>{dup.nfCte}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-600 ${opacidade}`}>{dup.clienteSacado}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-600 text-right ${opacidade}`}>{formatBRLNumber(dup.valorBruto)}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-red-600 text-right ${opacidade}`}>{formatBRLNumber(dup.valorJuros)}</td>
                                                <td className={`px-4 py-2 whitespace-nowrap text-sm text-gray-600 ${opacidade}`}>{formatDate(dup.dataVencimento)}</td>
                                                
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                                                    <div ref={openMenuId === dup.id ? menuRef : null} className="relative inline-block text-left">
                                                        <button onClick={() => setOpenMenuId(openMenuId === dup.id ? null : dup.id)} className="p-1 rounded-full hover:bg-gray-200">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                        </button>
                                                        {openMenuId === dup.id && (
                                                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                                <div className="py-1">
                                                                    {isLiquidado ? (
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleEstornar(dup.id); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Estornar Liquidação</a>
                                                                    ) : (
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleAbrirModalLiquidacao(dup); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Liquidar Duplicata</a>
                                                                    )}
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(dup.operacaoId); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Gerar PDF</a>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleAbrirEmailModal(dup.operacaoId, dup.tipoOperacaoNome); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Enviar por E-mail</a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {isLiquidado && dup.dataLiquidacao && (
                                                    <td className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black bg-opacity-10 pointer-events-none">
                                                        <span className="bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded-md">
                                                            Baixada em {formatDate(dup.dataLiquidacao)} na conta {dup.contaLiquidacao}
                                                        </span>
                                                    </td>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination totalItems={duplicatas.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={paginate} />
                    </div>
                </div>
            </main>
        </>
    );
}