'use client';

// Garanta que o componente recebe 'onFilterChange' e o usa nos inputs.
export default function FiltroLateral({ filters, onFilterChange, onApply, onClear, saldos }) {
    
    // Adiciona uma verificação para garantir que 'saldos' é um array
    const contas = Array.isArray(saldos) ? saldos : [];
    
    return (
        <div className="w-full lg:w-80 flex-shrink-0 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Filtros</h2>
            <div className="space-y-4">
                {/* Filtro por Conta */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Conta</label>
                    <select 
                        name="contaBancaria" 
                        value={filters.contaBancaria} 
                        onChange={onFilterChange} // Usa a prop 'onFilterChange'
                        className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"
                    >
                        <option value="">Todas as Contas</option>
                        {contas.map(conta => (
                            <option key={conta.contaBancaria} value={conta.contaBancaria}>{conta.contaBancaria}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Período */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Período</label>
                    <div className="mt-1 space-y-2">
                        <input type="date" name="dataInicio" value={filters.dataInicio} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                        <input type="date" name="dataFim" value={filters.dataFim} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                    </div>
                </div>

                {/* Filtro por Descrição */}
                <div>
                    <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700">Descrição</label>
                    <input id="descricao" type="text" name="descricao" placeholder="Parte da descrição..." value={filters.descricao} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col space-y-2 pt-2">
                    <button onClick={onApply} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700">Aplicar</button>
                    <button onClick={onClear} className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-300">Limpar</button>
                </div>
            </div>
        </div>
    );
};