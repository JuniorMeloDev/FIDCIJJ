'use client';

// Recebe as novas propriedades: tipoOperacaoId, setTipoOperacaoId e a lista tiposOperacao
export default function OperacaoHeader({ dataOperacao, setDataOperacao, tipoOperacaoId, setTipoOperacaoId, tiposOperacao, empresaCedente, setEmpresaCedente }) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dados da Operação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="dataOperacao" className="block text-sm font-medium text-gray-700">Data da Operação</label>
                    <input type="date" id="dataOperacao" value={dataOperacao} onChange={e => setDataOperacao(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label htmlFor="tipoOperacao" className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                    {/* O select agora é populado dinamicamente a partir da lista vinda da API */}
                    <select 
                        id="tipoOperacao" 
                        value={tipoOperacaoId} 
                        onChange={e => setTipoOperacaoId(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Selecione...</option>
                        {tiposOperacao.map(op => (
                            <option key={op.id} value={op.id}>
                                {op.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="empresaCedente" className="block text-sm font-medium text-gray-700">Empresa Cedente</label>
                    <input type="text" id="empresaCedente" value={empresaCedente} onChange={e => setEmpresaCedente(e.target.value)} placeholder="Nome da empresa" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                </div>
            </div>
        </section>
    );
}