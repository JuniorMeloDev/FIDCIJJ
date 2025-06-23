'use client';

export default function AdicionarNotaFiscalForm({ novaNf, handleInputChange, handleAddNotaFiscal, tipoOperacao, isLoading }) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Adicionar Nota Fiscal / CT-e</h2>
          <form onSubmit={handleAddNotaFiscal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="nfCte" className="block text-sm font-medium text-gray-700">Número NF/CT-e</label>
              <input type="text" name="nfCte" value={novaNf.nfCte} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="dataNf" className="block text-sm font-medium text-gray-700">Data da NF</label>
              <input type="date" name="dataNf" value={novaNf.dataNf} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="valorNf" className="block text-sm font-medium text-gray-700">Valor</label>
              <input type="text" name="valorNf" value={novaNf.valorNf} onChange={handleInputChange} placeholder="R$ 0,00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label htmlFor="clienteSacado" className="block text-sm font-medium text-gray-700">Cliente (Sacado)</label>
              <input type="text" name="clienteSacado" value={novaNf.clienteSacado} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="parcelas" className="block text-sm font-medium text-gray-700">Parcelas</label>
              <input type="number" name="parcelas" value={novaNf.parcelas} onChange={handleInputChange} placeholder="1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="prazos" className="block text-sm font-medium text-gray-700">Prazos</label>
              <input type="text" name="prazos" value={novaNf.prazos} onChange={handleInputChange} placeholder="Ex: 15/30/45" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
            </div>
            {tipoOperacao === 'A_VISTA' && (
              <div>
                <label htmlFor="peso" className="block text-sm font-medium text-gray-700">Peso</label>
                <input type="number" name="peso" value={novaNf.peso} onChange={handleInputChange} placeholder="0.00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
            )}
            <div className="lg:col-start-4">
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                {isLoading ? 'A calcular...' : 'Adicionar NF'}
              </button>
            </div>
          </form>
        </section>
    );
}
