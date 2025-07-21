'use client';

import AutocompleteSearch from './AutoCompleteSearch';

export default function DashboardFiltros({ filters, onFilterChange, onAutocompleteSelect, tiposOperacao, fetchClientes, fetchSacados, onClear }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Filtro de Período */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Período</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="date" name="dataInicio" value={filters.dataInicio}
                            onChange={onFilterChange}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                            type="date" name="dataFim" value={filters.dataFim}
                            onChange={onFilterChange}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Filtro de Tipo de Operação */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                    <select
                        name="tipoOperacaoId" value={filters.tipoOperacaoId}
                        onChange={onFilterChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos</option>
                        {tiposOperacao.map(op => (
                            <option key={op.id} value={op.id}>{op.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Cliente (Cedente) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cedente</label>
                    <AutocompleteSearch
                        name="clienteNome"
                        value={filters.clienteNome}
                        onChange={onFilterChange}
                        onSelect={(cliente) => onAutocompleteSelect('cliente', cliente)}
                        fetchSuggestions={fetchClientes}
                        placeholder="Todos os Cedentes"
                    />
                </div>

                {/* Filtro de Sacado (Devedor) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sacado</label>
                    <AutocompleteSearch
                        name="sacado"
                        value={filters.sacado}
                        onChange={onFilterChange}
                        onSelect={(sacado) => onAutocompleteSelect('sacado', sacado)}
                        fetchSuggestions={fetchSacados}
                        placeholder="Todos os Sacados"
                    />
                </div>

                {/* Botão de Limpar */}
                <div className="md:col-span-4 lg:col-span-1">
                    <button
                        onClick={onClear}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md text-sm"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
