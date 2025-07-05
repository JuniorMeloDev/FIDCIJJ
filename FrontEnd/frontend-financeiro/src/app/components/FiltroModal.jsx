'use client';

export default function FiltroModal({ isOpen, onClose, filters, onFilterChange, onApply, onClear }) {
    if (!isOpen) return null;

    const handleApplyAndClose = () => {
        onApply();
        onClose();
    };

    const handleClearAndClose = () => {
        onClear();
        onClose();
    };

    return (
        // Overlay semitransparente que fecha o modal ao clicar
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-40" onClick={onClose}>
            {/* Corpo do Modal */}
            <div className="bg-white p-6 rounded-lg border-8 shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Filtrar Duplicatas</h2>
                
                {/* Grid para organizar os filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    
                    {/* Filtro de Data de Operação */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Período Data Op.</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="date" name="dataOpInicio" value={filters.dataOpInicio} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                            <span className="text-gray-500 font-semibold">-</span>
                            <input type="date" name="dataOpFim" value={filters.dataOpFim} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                        </div>
                    </div>

                    {/* Filtro de Data de Vencimento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Período Data Venc.</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input type="date" name="dataVencInicio" value={filters.dataVencInicio} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                            <span className="text-gray-500 font-semibold">-</span>
                            <input type="date" name="dataVencFim" value={filters.dataVencFim} onChange={onFilterChange} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                        </div>
                    </div>

                    {/* Filtro de Sacado */}
                    <div>
                        <label htmlFor="sacado" className="block text-sm font-medium text-gray-700">Sacado</label>
                        <input id="sacado" type="text" name="sacado" placeholder="Nome do sacado..." value={filters.sacado} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                    </div>

                    {/* Filtro de NF/CT-e */}
                    <div>
                        <label htmlFor="nfCte" className="block text-sm font-medium text-gray-700">NF/CT-e</label>
                        <input id="nfCte" type="text" name="nfCte" placeholder="Número da nota..." value={filters.nfCte} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-2"/>
                    </div>
                    
                    {/* Filtro de Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" name="status" value={filters.status} onChange={onFilterChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm p-2">
                            <option value="Todos">Todos</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Recebido">Recebido</option>
                        </select>
                    </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 mt-8 border-t pt-4">
                    <button onClick={handleClearAndClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">Limpar</button>
                    <button onClick={handleApplyAndClose} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">Aplicar Filtros</button>
                </div>
            </div>
        </div>
    );
};