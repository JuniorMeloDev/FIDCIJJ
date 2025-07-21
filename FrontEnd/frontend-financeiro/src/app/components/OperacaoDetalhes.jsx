'use client';

import { formatBRLNumber } from '@/app/utils/formatters';

export default function OperacaoDetalhes({
    notasFiscais,
    descontos,
    totais,
    handleSalvarOperacao,
    handleLimparTudo,
    isSaving,
    onAddDescontoClick,
    onRemoveDesconto,
    contasBancarias,
    contaBancariaId,
    setContaBancariaId
}) {
    return (
        <section className="bg-white p-2 rounded-lg shadow-md mt-1">
            <h2 className="text-2xl font-semibold mb-4">Duplicatas da Operação</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NF/CT-e</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Bruto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deságio (Juros)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Líquido</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {notasFiscais.map((nf) => (
                            <tr key={nf.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{nf.nfCte}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{nf.clienteSacado}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatBRLNumber(nf.valorNf)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-right">-{formatBRLNumber(nf.jurosCalculado || 0)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatBRLNumber(nf.valorLiquidoCalculado || nf.valorNf)}</td>
                            </tr>
                        ))}
                        {notasFiscais.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">Nenhuma duplicata adicionada a esta operação.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700">Outros Descontos / Taxas</h3>
                    {descontos.length > 0 ? (
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {descontos.map(d => (
                                <li key={d.id} className="p-3 flex justify-between items-center text-sm">
                                    <span>{d.descricao}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-red-600">-{formatBRLNumber(d.valor)}</span>
                                        <button onClick={() => onRemoveDesconto(d.id)} className="text-gray-400 hover:text-red-500">&times;</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Nenhum desconto adicionado.</p>
                    )}
                    <button onClick={onAddDescontoClick} type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        + Adicionar Desconto/Taxa
                    </button>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Valor Total dos Títulos:</span>
                        <span>{formatBRLNumber(totais.valorTotalBruto)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-red-600">
                        <span>(-) Deságio Total:</span>
                        <span>{formatBRLNumber(totais.desagioTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-red-600">
                        <span>(-) Outros Descontos:</span>
                        <span>-{formatBRLNumber(totais.totalOutrosDescontos)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Líquido da Operação:</span>
                        <span className="text-indigo-600">{formatBRLNumber(totais.liquidoOperacao)}</span>
                    </div>

                    {/* Dropdown de conta bancária */}
                    <div className="flex flex-col gap-2 pt-2">
                        <label htmlFor="contaBancaria" className="text-sm font-medium text-gray-600">Conta Bancária para Débito:</label>
                        <select
                            id="contaBancaria"
                            name="contaBancaria"
                            value={contaBancariaId}
                            onChange={e => setContaBancariaId(e.target.value)}
                            className="p-2 rounded-md border border-gray-300"
                        >
                            <option value="">Selecione uma conta</option>
                            {contasBancarias.map(conta => (
                                <option key={conta.id} value={conta.id}>
                                    {conta.banco} - Ag. {conta.agencia} / CC {conta.contaCorrente}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={handleLimparTudo} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md hover:bg-gray-300">
                    Limpar
                </button>
                <button
                    type="button"
                    onClick={handleSalvarOperacao}
                    disabled={isSaving}
                    className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md shadow-sm hover:bg-green-700 disabled:bg-green-300"
                >
                    {isSaving ? 'Salvando.' : 'Salvar Operação'}
                </button>
            </div>
        </section>
    );
}
