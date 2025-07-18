'use client';

import AutocompleteSearch from "./AutoCompleteSearch";

export default function OperacaoHeader({
    dataOperacao, setDataOperacao,
    tipoOperacaoId, setTipoOperacaoId, tiposOperacao,
    empresaCedente, setEmpresaCedente,
    onSelectCedente, fetchClientes
}) {
    return (
        <div className="bg-white p-2 rounded-lg shadow-md mb-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Dados da Operação</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data da Operação</label>
                    <input
                        type="date"
                        value={dataOperacao}
                        onChange={e => setDataOperacao(e.target.value)}
                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Operação</label>
                    <select
                        value={tipoOperacaoId}
                        onChange={e => setTipoOperacaoId(e.target.value)}
                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm p-2"
                    >
                        <option value="">Selecione...</option>
                        {tiposOperacao.map(op => (
                            <option key={op.id} value={op.id}>{op.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cedente</label>
                    <AutocompleteSearch
                        name="empresaCedente"
                        value={empresaCedente}
                        onChange={(e) => setEmpresaCedente(e.target.value)}
                        onSelect={onSelectCedente}
                        fetchSuggestions={fetchClientes}
                        placeholder="Digite o nome do cliente"
                    />
                </div>
            </div>
        </div>
    );
}