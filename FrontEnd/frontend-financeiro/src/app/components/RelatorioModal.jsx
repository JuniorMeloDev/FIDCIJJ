'use client';

import { useState, useEffect } from 'react';
import AutocompleteSearch from './AutoCompleteSearch';

const API_URL = "http://localhost:8080/api";

export default function RelatorioModal({ isOpen, onClose, tiposOperacao, fetchClientes, fetchSacados }) {
    const initialState = {
        dataInicio: "", dataFim: "", tipoOperacaoId: "", clienteId: "", clienteNome: "", sacado: "", conta: "", status: "Todos", categoria: "Todos", tipoValor: "Todos"
    };
    const [reportType, setReportType] = useState('fluxoCaixa');
    const [filters, setFilters] = useState(initialState);
    const [isGenerating, setIsGenerating] = useState(false);
    const [contas, setContas] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchContas = async () => {
                try {
                    const res = await fetch(`${API_URL}/dashboard/saldos`);
                    if (res.ok) {
                        const data = await res.json();
                        setContas(data.map(c => c.contaBancaria));
                    }
                } catch (error) {
                    console.error("Erro ao buscar contas:", error);
                }
            };
            fetchContas();
        }
    }, [isOpen]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const clearFilters = () => {
        setFilters(initialState);
    };

    const handleAutocompleteSelect = (name, item) => {
        if (name === "cliente") {
            setFilters(prev => ({ ...prev, clienteId: item?.id || "", clienteNome: item?.nome || "" }));
        } else if (name === "sacado") {
            setFilters(prev => ({ ...prev, sacado: item?.nome || "" }));
        }
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        const params = new URLSearchParams();
        
        const endpointMap = {
          fluxoCaixa: 'fluxo-caixa',
          duplicatas: 'duplicatas',
          totalOperado: 'total-operado'
        };
        
        const endpoint = endpointMap[reportType] || 'fluxo-caixa';

        if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
        if (filters.dataFim) params.append('dataFim', filters.dataFim);
        if (filters.tipoOperacaoId) params.append('tipoOperacaoId', filters.tipoOperacaoId);
        if (filters.clienteId) params.append('clienteId', filters.clienteId);
        if (filters.sacado) params.append('sacado', filters.sacado);
        if (filters.conta) params.append('conta', filters.conta);
        if (filters.status) params.append('status', filters.status);
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.tipoValor) params.append('tipoValor', filters.tipoValor);

        try {
          const response = await fetch(`${API_URL}/relatorios/${endpoint}?${params.toString()}`);

          if (!response.ok) {
            throw new Error('Não foi possível gerar o relatório.');
          }

          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${reportType}.pdf`;
          if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
              if (filenameMatch && filenameMatch.length > 1) {
                  filename = filenameMatch[1].replace(/[^a-zA-Z0-9.,\s-]/g, '').trim();
              }
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          onClose();
        } catch (error) {
          console.error('Erro ao gerar relatório:', error);
          alert('Erro ao gerar relatório. Verifique o console para mais detalhes.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Gerar Relatório</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Relatório</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
                        >
                            <option value="fluxoCaixa">Fluxo de Caixa</option>
                            <option value="duplicatas">Consulta de Duplicatas</option>
                            <option value="totalOperado">Total Operado</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Início</label>
                            <input type="date" name="dataInicio" value={filters.dataInicio} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Fim</label>
                            <input type="date" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm"/>
                        </div>

                        {reportType !== 'fluxoCaixa' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                                    <select name="tipoOperacaoId" value={filters.tipoOperacaoId} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm">
                                        <option value="">Todos</option>
                                        {tiposOperacao.map(op => <option key={op.id} value={op.id}>{op.nome}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cedente</label>
                                    <AutocompleteSearch name="clienteNome" value={filters.clienteNome} onChange={handleFilterChange} onSelect={(c) => handleAutocompleteSelect('cliente', c)} fetchSuggestions={fetchClientes} placeholder="Todos"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sacado</label>
                                    <AutocompleteSearch name="sacado" value={filters.sacado} onChange={handleFilterChange} onSelect={(s) => handleAutocompleteSelect('sacado', s)} fetchSuggestions={fetchSacados} placeholder="Todos"/>
                                </div>
                            </>
                        )}

                        {reportType === 'fluxoCaixa' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Conta</label>
                                    <select name="conta" value={filters.conta} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm">
                                        <option value="">Todas</option>
                                        {contas.map(conta => <option key={conta} value={conta}>{conta}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                                    <select name="categoria" value={filters.categoria} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm">
                                        <option value="Todos">Todas</option>
                                        <option value="Recebimento">Recebimento</option>
                                        <option value="Pagamento de Borderô">Pagamento de Borderô</option>
                                        <option value="Receita Avulsa">Receita Avulsa</option>
                                        <option value="Despesa Avulsa">Despesa Avulsa</option>
                                        <option value="Transferencia Enviada">Transferência Enviada</option>
                                        <option value="Transferencia Recebida">Transferência Recebida</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                    <select name="tipoValor" value={filters.tipoValor} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm">
                                        <option value="Todos">Todos</option>
                                        <option value="credito">Crédito</option>
                                        <option value="debito">Débito</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {reportType === 'duplicatas' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 w-full border-gray-300 rounded-md p-1.5 text-sm">
                                    <option value="Todos">Todos</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Recebido">Recebido</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={clearFilters}
                        className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 text-sm"
                    >
                        Limpar
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 text-sm disabled:bg-indigo-400">
                            {isGenerating ? 'Gerando...' : 'Gerar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}