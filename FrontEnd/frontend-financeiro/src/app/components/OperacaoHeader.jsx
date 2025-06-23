'use client';

export default function OperacaoHeader({ dataOperacao, setDataOperacao, tipoOperacao, setTipoOperacao, empresaCedente, setEmpresaCedente }) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dados da Operação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="dataOperacao" className="block text-sm font-medium text-gray-700">Data da Operação</label>
                    <input type="date" id="dataOperacao" value={dataOperacao} onChange={e => setDataOperacao(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                    <label htmlFor="tipoOperacao" className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                    <select id="tipoOperacao" value={tipoOperacao} onChange={e => setTipoOperacao(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">Selecione...</option>
                        <option value="A_VISTA">A VISTA</option>
                        <option value="IJJ">IJJ</option>
                        <option value="IJJ_TRANSREC">IJJ TRANSREC</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="empresaCedente" className="block text-sm font-medium text-gray-700">Empresa Cedente</label>
                    <input type="text" id="empresaCedente" value={empresaCedente} onChange={e => setEmpresaCedente(e.target.value)} placeholder="Nome da empresa" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
            </div>
        </section>
    );
}