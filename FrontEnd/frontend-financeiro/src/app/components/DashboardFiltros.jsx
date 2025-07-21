'use client';

import AutocompleteSearch from './AutoCompleteSearch';

export default function DashboardFiltros({ filters, onFilterChange, onAutocompleteSelect, tiposOperacao, contasBancarias, fetchClientes, fetchSacados, onClear }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                
                <div className="md:col-span-2">
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">Período</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="date" id="dataInicio" name="dataInicio" value={filters.dataInicio}
                            onChange={onFilterChange}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">até</span>
                        <input
                            type="date" id="dataFim" name="dataFim" value={filters.dataFim}
                            onChange={onFilterChange}
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="tipoOperacaoId" className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                    <select
                        id="tipoOperacaoId" name="tipoOperacaoId" value={filters.tipoOperacaoId}
                        onChange={onFilterChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos</option>
                        {tiposOperacao.map(op => (
                            <option key={op.id} value={op.id}>{op.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="clienteNome" className="block text-sm font-medium text-gray-700">Cedente</label>
                    <AutocompleteSearch
                        id="clienteNome"
                        name="clienteNome"
                        value={filters.clienteNome}
                        onChange={onFilterChange}
                        onSelect={(cliente) => onAutocompleteSelect('cliente', cliente)}
                        fetchSuggestions={fetchClientes}
                        placeholder="Todos os Cedentes"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="sacado" className="block text-sm font-medium text-gray-700">Sacado</label>
                    <AutocompleteSearch
                        id="sacado"
                        name="sacado"
                        value={filters.sacado}
                        onChange={onFilterChange}
                        onSelect={(sacado) => onAutocompleteSelect('sacado', sacado)}
                        fetchSuggestions={fetchSacados}
                        placeholder="Todos os Sacados"
                    />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="contaBancaria" className="block text-sm font-medium text-gray-700">Conta Bancária</label>
                    <select
                        id="contaBancaria" name="contaBancaria" value={filters.contaBancaria}
                        onChange={onFilterChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas</option>
                        {contasBancarias.map(conta => (
                            <option key={conta.id} value={conta.contaCorrente}>{`${conta.banco} - ${conta.agencia}/${conta.contaCorrente}`}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
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