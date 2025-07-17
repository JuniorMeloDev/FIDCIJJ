'use client';

import { useState, useEffect, useRef } from 'react';
import LancamentoModal from '@/app/components/LancamentoModal';
import Notification from '@/app/components/Notification';
import ConfirmacaoModal from '@/app/components/ConfirmacaoModal';
import ConfirmEmailModal from '@/app/components/EmailModal';
import { formatBRLNumber, formatDate } from '@/app/utils/formatters';
import FiltroLateral from '@/app/components/FiltroLateral';
import Pagination from '@/app/components/Pagination';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const API_URL_MOVIMENTACOES = 'http://localhost:8080/api/movimentacoes-caixa';
const API_URL_DASHBOARD = 'http://localhost:8080/api/dashboard';
const API_URL_CADASTROS = 'http://localhost:8080/api/cadastros';

const ITEMS_PER_PAGE = 7;

export default function FluxoDeCaixaPage() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [itemParaExcluir, setItemParaExcluir] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [contasMaster, setContasMaster] = useState([]);
    const [clienteMasterNome, setClienteMasterNome] = useState('');

    const [filters, setFilters] = useState({
        dataInicio: '', dataFim: '', descricao: '', contaBancaria: '', categoria: 'Todos'
    });
    
    const [sortConfig, setSortConfig] = useState({ key: 'dataMovimento', direction: 'DESC' });
    
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [itemParaEmail, setItemParaEmail] = useState(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const fetchMovimentacoes = async (currentFilters, currentSortConfig) => {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (currentFilters.dataInicio) params.append('dataInicio', currentFilters.dataInicio);
        if (currentFilters.dataFim) params.append('dataFim', currentFilters.dataFim);
        if (currentFilters.descricao) params.append('descricao', currentFilters.descricao);
        if (currentFilters.contaBancaria) params.append('conta', currentFilters.contaBancaria);
        if (currentFilters.categoria && currentFilters.categoria !== 'Todos') {
            params.append('categoria', currentFilters.categoria);
        }
        
        params.append('sort', currentSortConfig.key);
        params.append('direction', currentSortConfig.direction);

        try {
            const response = await fetch(`${API_URL_MOVIMENTACOES}?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao carregar movimentações.');
            const data = await response.json();
            setMovimentacoes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchSaldos = async () => {
        try {
            const saldosResponse = await fetch(`${API_URL_DASHBOARD}/saldos`);
            if (!saldosResponse.ok) throw new Error('Falha ao carregar saldos.');
            const saldosData = await saldosResponse.json();
            setSaldos(saldosData);
        } catch (err) {
            showNotification(err.message, 'error');
            console.error(err.message);
        }
    };

    useEffect(() => {
        const fetchStaticData = async () => {
             try {
                const [masterContasResponse, clientesResponse] = await Promise.all([
                    fetch(`${API_URL_CADASTROS}/contas/master`),
                    fetch(`${API_URL_CADASTROS}/clientes`)
                ]);

                if (!masterContasResponse.ok || !clientesResponse.ok) {
                    throw new Error('Falha ao carregar dados para o modal.');
                }
                
                const masterContasData = await masterContasResponse.json();
                const clientesData = await clientesResponse.json();

                const masterContasFormatadas = masterContasData.map(c => ({ contaBancaria: `${c.banco} - ${c.agencia}/${c.contaCorrente}` }));
                setContasMaster(masterContasFormatadas);
                
                if (clientesData.length > 0) {
                    setClienteMasterNome(clientesData[0].nome);
                }
            } catch (err) {
                 console.error(err.message);
            }
        };
        
        fetchStaticData();
        fetchSaldos();
    }, []);

    useEffect(() => {
        fetchMovimentacoes(filters, sortConfig);
    }, [filters, sortConfig]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSort = (key) => {
        let direction = 'ASC';
        if (sortConfig.key === key && sortConfig.direction === 'ASC') {
            direction = 'DESC';
        }
        setCurrentPage(1);
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
        if (sortConfig.direction === 'ASC') return <FaSortUp />;
        return <FaSortDown />;
    };

    const applyFilters = () => {
        setCurrentPage(1);
    };

    const clearFilters = () => {
        const cleared = { dataInicio: '', dataFim: '', descricao: '', contaBancaria: '', categoria: 'Todos' };
        setFilters(cleared);
        setCurrentPage(1);
    };

    // --- FUNÇÃO QUE FALTAVA ---
    const handleFilterChange = (e) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleSaveLancamento = async (payload) => {
        try {
            const response = await fetch('http://localhost:8080/api/lancamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Falha ao salvar lançamento.");
            }
            showNotification('Lançamento salvo com sucesso!', 'success');
            fetchMovimentacoes(filters, sortConfig);
            fetchSaldos();
            return true;
        } catch (error) {
            showNotification(error.message, 'error');
            return false;
        }
    };
    
    const handleDeleteRequest = (id) => {
        setOpenMenuId(null);
        setItemParaExcluir(id);
    };

    const handleConfirmDelete = async () => {
        if(!itemParaExcluir) return;
        try {
            await fetch(`${API_URL_MOVIMENTACOES}/${itemParaExcluir}`, { method: 'DELETE' });
            showNotification('Lançamento excluído com sucesso!', 'success');
            fetchMovimentacoes(filters, sortConfig);
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setItemParaExcluir(null);
        }
    };

    const handleGeneratePdf = async (operacaoId) => {
        setOpenMenuId(null);
        try {
            const response = await fetch(`http://localhost:8080/api/operacoes/${operacaoId}/pdf`);
            if (!response.ok) throw new Error('Não foi possível gerar o PDF.');
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `bordero-${operacaoId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1].replace(/[^a-zA-Z0-9.,\s-]/g, '').trim();
                }
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.message);
        }
    };
    
    const handleAbrirEmailModal = (operacaoId) => {
        setItemParaEmail({ id: operacaoId });
        setIsEmailModalOpen(true);
        setOpenMenuId(null);
    };

    const handleSendEmail = async (destinatarios) => {
        if (!itemParaEmail) return;
        setIsSendingEmail(true);
        try {
            const response = await fetch(`http://localhost:8080/api/operacoes/${itemParaEmail.id}/enviar-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destinatarios }),
            });
            if (!response.ok) throw new Error("Falha ao enviar o e-mail.");
            showNotification("E-mail(s) enviado(s) com sucesso!", "success");
        } catch (err) {
            showNotification(err.message, "error");
        } finally {
            setIsSendingEmail(false);
            setIsEmailModalOpen(false);
        }
    };
    
    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = movimentacoes.slice(indexOfFirstItem, indexOfLastItem);

    if (loading && movimentacoes.length === 0) return <div className="text-center p-10">A carregar...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Erro: {error}</div>;

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <LancamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLancamento} contasMaster={contasMaster} clienteMasterNome={clienteMasterNome} />
            <ConfirmacaoModal isOpen={!!itemParaExcluir} onClose={() => setItemParaExcluir(null)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message="Tem a certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."/>
            <ConfirmEmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} onSend={handleSendEmail} isSending={isSendingEmail} />

            <main className="p-4 sm:p-6">
                <header className="mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Fluxo de Caixa</h1>
                        <p className="text-sm text-gray-500">Visão geral das suas movimentações financeiras.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700">
                        + Novo Lançamento
                    </button>
                </header>
                
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Saldos Atuais</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {saldos.map((saldo, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg shadow">
                                <p className="text-sm text-gray-500 truncate">{saldo.contaBancaria}</p>
                                <p className={`text-xl font-bold ${saldo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatBRLNumber(saldo.saldo)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <FiltroLateral
                        filters={filters}
                        saldos={saldos}
                        onFilterChange={handleFilterChange}
                        onApply={applyFilters}
                        onClear={clearFilters}
                    />
                    <div className="flex-grow bg-white p-4 rounded-lg shadow-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button onClick={() => handleSort('dataMovimento')} className="flex items-center gap-2">Data {getSortIcon('dataMovimento')}</button>
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button onClick={() => handleSort('descricao')} className="flex items-center gap-2">Descrição {getSortIcon('descricao')}</button>
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button onClick={() => handleSort('valor')} className="flex items-center gap-2 float-right">Valor {getSortIcon('valor')}</button>
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="5" className="text-center py-10">A carregar...</td></tr>
                                    ) : currentItems.length > 0 ? (
                                        currentItems.map((mov) => (
                                            <tr key={mov.id}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(mov.dataMovimento)}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{mov.descricao}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{mov.contaBancaria}</td>
                                                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-semibold ${mov.valor >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                                    {formatBRLNumber(mov.valor)}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                                                    <div ref={openMenuId === mov.id ? menuRef : null} className="relative inline-block text-left">
                                                        <button onClick={() => setOpenMenuId(openMenuId === mov.id ? null : mov.id)} className="p-1 rounded-full hover:bg-gray-200">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                        </button>
                                                        {openMenuId === mov.id && (
                                                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                                <div className="py-1">
                                                                    {mov.operacaoId && (
                                                                        <>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(mov.operacaoId); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Gerar PDF do Borderô</a>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handleAbrirEmailModal(mov.operacaoId); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Enviar Borderô por E-mail</a>
                                                                            <div className="border-t my-1"></div>
                                                                        </>
                                                                    )}
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteRequest(mov.id); }} className={`block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${mov.categoria === 'Pagamento de Borderô' || mov.categoria === 'Recebimento' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                        Excluir Lançamento
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center py-10 text-gray-500">Nenhuma movimentação encontrada.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            totalItems={movimentacoes.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}