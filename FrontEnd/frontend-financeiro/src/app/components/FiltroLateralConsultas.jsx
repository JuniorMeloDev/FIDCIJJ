'use client';

import AutocompleteSearch from './AutoCompleteSearch';

export default function FiltroLateralConsultas({ filters, onFilterChange, onClear, tiposOperacao, fetchClientes, onAutocompleteSelect }) {
    return (
        <div className="w-full lg:w-72 flex-shrink-0 bg-white p-3 rounded-lg shadow-md">
            <h2 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3">Filtros de Consulta</h2>
            
            <div className="space-y-2">
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Data Operação</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" name="dataOpInicio" value={filters.dataOpInicio} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                        <input type="date" name="dataOpFim" value={filters.dataOpFim} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Data Vencimento</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" name="dataVencInicio" value={filters.dataVencInicio} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                        <input type="date" name="dataVencFim" value={filters.dataVencFim} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                    </div>
                </div>

                <div>
                    <label htmlFor="cedente" className="block text-xs font-bold text-gray-600">Cedente</label>
                    <AutocompleteSearch
                        name="clienteNome"
                        value={filters.clienteNome}
                        onChange={onFilterChange}
                        onSelect={(cliente) => onAutocompleteSelect('cliente', cliente)}
                        fetchSuggestions={fetchClientes}
                        placeholder="Todos os Cedentes"
                    />
                </div>
                 <div>
                    <label htmlFor="sacado" className="block text-xs font-bold text-gray-600">Sacado</label>
                    <input id="sacado" type="text" name="sacado" placeholder="Nome do sacado..." value={filters.sacado} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                </div>
                 <div>
                    <label htmlFor="tipoOperacaoId" className="block text-xs font-bold text-gray-600">Tipo de Operação</label>
                    <select id="tipoOperacaoId" name="tipoOperacaoId" value={filters.tipoOperacaoId} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5">
                        <option value="">Todos</option>
                        {tiposOperacao.map(op => (
                            <option key={op.id} value={op.id}>{op.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="nfCte" className="block text-xs font-bold text-gray-600">NF/CT-e</label>
                    <input id="nfCte" type="text" name="nfCte" placeholder="Número da nota..." value={filters.nfCte} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5"/>
                </div>

                <div>
                    <label htmlFor="status" className="block text-xs font-bold text-gray-600">Status</label>
                    <select id="status" name="status" value={filters.status} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-1.5">
                        <option value="Todos">Todos</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Recebido">Recebido</option>
                    </select>
                </div>

                <div className="flex flex-col space-y-2 pt-2 border-t mt-2">
                    <button onClick={onClear} className="w-full bg-gray-200 text-gray-700 font-semibold py-1.5 rounded-md hover:bg-gray-300 text-sm">Limpar</button>
                </div>
            </div>
        </div>
    );
};