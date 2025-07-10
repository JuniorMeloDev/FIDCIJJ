'use client';

export default function FiltroLateralClientes({ filters, onFilterChange, onClear }) {
    return (
        <div className="w-full lg:w-72 flex-shrink-0 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Filtros de Clientes</h2>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">Nome do Cliente</label>
                    <input 
                        id="nome" 
                        type="text" 
                        name="nome" 
                        placeholder="Parte do nome..." 
                        value={filters.nome} 
                        onChange={onFilterChange} 
                        className="mt-1 w-full border border-gray-300 rounded-md p-1.5 text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="cnpj" className="block text-sm font-semibold text-gray-700">CNPJ / CPF</label>
                    <input 
                        id="cnpj" 
                        type="text" 
                        name="cnpj" 
                        placeholder="Número do documento..." 
                        value={filters.cnpj} 
                        onChange={onFilterChange} 
                        className="mt-1 w-full border border-gray-300 rounded-md p-1.5 text-sm"
                    />
                </div>

                <div className="flex flex-col space-y-2 pt-2 border-t mt-4">
                    <button 
                        onClick={onClear} 
                        className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-300 text-sm"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};