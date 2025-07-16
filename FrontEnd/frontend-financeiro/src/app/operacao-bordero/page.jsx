'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AdicionarNotaFiscalForm from '@/app/components/AdicionarNotaFiscalForm';
import OperacaoDetalhes from '@/app/components/OperacaoDetalhes';
import OperacaoHeader from '@/app/components/OperacaoHeader';
import Notification from '@/app/components/Notification';
import DescontoModal from '@/app/components/DescontoModal';
import EditClienteModal from '@/app/components/EditClienteModal';
import EditSacadoModal from '@/app/components/EditSacadoModal';
import EditTipoOperacaoModal from '@/app/components/EditTipoOperacaoModal';
import { formatBRLInput, parseBRL } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api';

export default function OperacaoBorderoPage() {
    // States do formulário principal
    const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0]);
    const [tipoOperacaoId, setTipoOperacaoId] = useState('');
    const [empresaCedente, setEmpresaCedente] = useState('');
    const [novaNf, setNovaNf] = useState({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '1', prazos: '' });
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [descontos, setDescontos] = useState([]);
    const [contasBancarias, setContasBancarias] = useState([]);
    const [contaBancariaId, setContaBancariaId] = useState('');

    
    // States de controlo da UI
    const [isDescontoModalOpen, setIsDescontoModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Para o cálculo de juros
    const [isSaving, setIsSaving] = useState(false);   // Para o salvamento da operação
    const [notification, setNotification] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);
    
    // States para as listas dinâmicas e fluxo de XML
    const [tiposOperacao, setTiposOperacao] = useState([]);
    const [clienteParaCriar, setClienteParaCriar] = useState(null);
    const [sacadoParaCriar, setSacadoParaCriar] = useState(null);
    const [tipoOperacaoParaCriar, setTipoOperacaoParaCriar] = useState(null);
    const [xmlDataPendente, setXmlDataPendente] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    useEffect(() => {
        fetchTiposOperacao();
        fetchContasMaster();
    }, []);

    const fetchTiposOperacao = async () => {
        try {
            const res = await fetch(`${API_URL}/cadastros/tipos-operacao`);
            const data = await res.json();
            setTiposOperacao(data);
        } catch (err) {
            showNotification('Erro ao carregar tipos de operação.', 'error');
        }
    };

    const fetchContasMaster = async () => {
        try {
            const res = await fetch(`${API_URL}/cadastros/contas/master`);
            const data = await res.json();
            setContasBancarias(data);
            if (data.length === 1) setContaBancariaId(data[0].id);
        } catch (err) {
            showNotification('Erro ao carregar contas bancárias.', 'error');
        }
    };

    const preencherFormularioComXml = (data) => {
        const prazosArray = data.parcelas ? data.parcelas.map(p => {
            const d1 = new Date(data.dataEmissao);
            const d2 = new Date(p.dataVencimento);
            const diffTime = Math.abs(d2 - d1);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }) : [];
        const prazosString = prazosArray.join('/');

        setNovaNf({
            nfCte: data.numeroNf || '',
            dataNf: data.dataEmissao ? data.dataEmissao.split('T')[0] : '',
            valorNf: data.valorTotal ? formatBRLInput(String(data.valorTotal * 100)) : '',
            clienteSacado: data.sacado.nome || '',
            parcelas: data.parcelas ? String(data.parcelas.length) : '1',
            prazos: prazosString,
        });
        setEmpresaCedente(data.emitente.nome || '');
        showNotification("Dados do XML preenchidos com sucesso!", "success");
        setXmlDataPendente(null);
    };

    const handleXmlUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        showNotification("A processar XML...", "info");
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${API_URL}/upload/nfe-xml`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(await response.text() || 'Falha ao ler o ficheiro XML.');
            const data = await response.json();
            setXmlDataPendente(data);
            if (!data.emitenteExiste) {
                setClienteParaCriar(data.emitente);
            } else if (!data.sacadoExiste) {
                setSacadoParaCriar(data.sacado);
            } else {
                // Busca tipo de operação pelo CNPJ do emitente e do sacado
                const tipoExistente = tiposOperacao.find(t =>
                    (t.cliente?.cnpj && t.cliente.cnpj.replace(/\D/g, '') === data.emitente.cnpj.replace(/\D/g, '')) &&
                    (t.sacado?.cnpj && t.sacado.cnpj.replace(/\D/g, '') === data.sacado.cnpj.replace(/\D/g, ''))
                );
                setEmpresaCedente(data.emitente.nome);
                if (tipoExistente) {
                    setTipoOperacaoId(tipoExistente.id);
                } else {
                    showNotification('Tipo de operação não encontrado. Se necessário, cadastre manualmente.', 'warning');
                }
                preencherFormularioComXml(data);
                setXmlDataPendente(null);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveNovoCliente = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/cadastros/clientes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error('Falha ao criar novo cliente.');
            showNotification('Cliente criado com sucesso!', 'success');
            setEmpresaCedente(data.nome);
            setClienteParaCriar(null);
            // Após criar cliente, verifica se precisa criar sacado
            if (xmlDataPendente && !xmlDataPendente.sacadoExiste) {
                setSacadoParaCriar(xmlDataPendente.sacado);
            } else if (xmlDataPendente) {
                preencherFormularioComXml(xmlDataPendente);
                setXmlDataPendente(null);
            }
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleSaveNovoTipoOperacao = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/cadastros/tipos-operacao`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error('Falha ao salvar tipo de operação.');
            const savedTipo = await response.json();
            showNotification('Tipo de Operação salvo com sucesso!', 'success');
            const updatedTipos = await fetchTiposOperacao();
            const newTipo = updatedTipos.find(t => t.id === savedTipo.id);
            if(newTipo) setTipoOperacaoId(newTipo.id);
            setTipoOperacaoParaCriar(null);
            if (xmlDataPendente && !xmlDataPendente.sacadoExiste) setSacadoParaCriar(xmlDataPendente.sacado);
            else if (xmlDataPendente) preencherFormularioComXml(xmlDataPendente);
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleSaveNovoSacado = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/cadastros/sacados`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (!response.ok) throw new Error('Falha ao criar novo sacado.');
            showNotification('Sacado criado com sucesso!', 'success');
            setSacadoParaCriar(null);
            if (xmlDataPendente) {
                preencherFormularioComXml(xmlDataPendente);
                setXmlDataPendente(null);
            }
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    const handleAddNotaFiscal = async (e) => {
        e.preventDefault();
        if (!tipoOperacaoId || !dataOperacao || !novaNf.clienteSacado) {
            showNotification('Preencha os Dados da Operação e o Sacado primeiro.', 'error');
            return;
        }
        setIsLoading(true);
        const valorNfFloat = parseBRL(novaNf.valorNf);
        const body = { dataOperacao, tipoOperacaoId: parseInt(tipoOperacaoId), clienteSacado: novaNf.clienteSacado, dataNf: novaNf.dataNf, valorNf: valorNfFloat, parcelas: parseInt(novaNf.parcelas) || 1, prazos: novaNf.prazos };
        try {
            const response = await fetch(`${API_URL}/operacoes/calcular-juros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao calcular os juros.');
            }
            const calculoResult = await response.json();
            const nfParaAdicionar = {
                id: Date.now(),
                ...novaNf,
                valorNf: valorNfFloat,
                parcelas: parseInt(novaNf.parcelas) || 1,
                jurosCalculado: calculoResult.totalJuros,
                valorLiquidoCalculado: calculoResult.valorLiquido,
            };
            setNotasFiscais([...notasFiscais, nfParaAdicionar]);
            setNovaNf({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '1', prazos: '' });
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'valorNf') {
            setNovaNf(prevState => ({ ...prevState, [name]: formatBRLInput(value) }));
        } else {
            setNovaNf(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSaveDesconto = (novoDesconto) => setDescontos([...descontos, novoDesconto]);
    const handleRemoveDesconto = (id) => setDescontos(descontos.filter(d => d.id !== id));
    
    const handleLimparTudo = () => {
        setDataOperacao(new Date().toISOString().split('T')[0]);
        setTipoOperacaoId('');
        setEmpresaCedente('');
        setNotasFiscais([]);
        setDescontos([]);
        setNovaNf({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '1', prazos: '' });
        showNotification('Formulário limpo.', 'success');
    };

    const handleSalvarOperacao = async () => {
    if (notasFiscais.length === 0) {
        showNotification('Adicione pelo menos uma nota fiscal para guardar a operação.', 'error');
        return;
    }

    if (!contaBancariaId) {
        showNotification('Selecione uma conta bancária para realizar o débito.', 'error');
        return;
    }

    setIsSaving(true);

    const payload = {
        dataOperacao,
        tipoOperacaoId: parseInt(tipoOperacaoId),
        empresaCedente,
        contaBancariaId: parseInt(contaBancariaId), // ✅ Aqui está a inclusão
        descontos,
        notasFiscais: notasFiscais.map(nf => ({
            ...nf,
            jurosCalculado: undefined,
            valorLiquidoCalculado: undefined
        }))
    };

    try {
        const response = await fetch(`${API_URL}/operacoes/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ocorreu um erro ao guardar a operação.');
        }

        const operacaoId = await response.json();
        showNotification(`Operação ${operacaoId} guardada com sucesso!`, 'success');
        handleLimparTudo();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        setIsSaving(false);
    }
};
    
    const totais = useMemo(() => {
        const valorTotalBruto = notasFiscais.reduce((acc, nf) => acc + nf.valorNf, 0);
        const desagioTotal = notasFiscais.reduce((acc, nf) => acc + (nf.jurosCalculado || 0), 0);
        const totalOutrosDescontos = descontos.reduce((acc, d) => acc + d.valor, 0);
        const liquidoOperacao = valorTotalBruto - desagioTotal - totalOutrosDescontos;
        return { valorTotalBruto, desagioTotal, totalOutrosDescontos, liquidoOperacao };
    }, [notasFiscais, descontos]);


    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <DescontoModal isOpen={isDescontoModalOpen} onClose={() => setIsDescontoModalOpen(false)} onSave={handleSaveDesconto} />
            <EditClienteModal isOpen={!!clienteParaCriar} onClose={() => setClienteParaCriar(null)} cliente={clienteParaCriar} onSave={handleSaveNovoCliente} showNotification={showNotification} />
            <EditTipoOperacaoModal isOpen={!!tipoOperacaoParaCriar} onClose={() => setTipoOperacaoParaCriar(null)} tipoOperacao={tipoOperacaoParaCriar} onSave={handleSaveNovoTipoOperacao} />
            <EditSacadoModal isOpen={!!sacadoParaCriar} onClose={() => setSacadoParaCriar(null)} sacado={sacadoParaCriar} onSave={handleSaveNovoSacado} showNotification={showNotification} tiposOperacao={tiposOperacao} />
            
            <main className="p-4 sm:p-6 flex flex-col h-full">
                <header className="mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Criar Borderô</h1>
                        <p className="text-sm text-gray-600 mt-1">Preencha os dados abaixo ou importe um XML.</p>
                    </div>
                    <div>
                        <input type="file" accept=".xml" ref={fileInputRef} onChange={handleXmlUpload} style={{ display: 'none' }} id="xml-upload-input"/>
                        <button onClick={() => fileInputRef.current.click()} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-800">
                            Importar NF-e (XML)
                        </button>
                    </div>
                </header>

                <OperacaoHeader 
                    dataOperacao={dataOperacao}
                    setDataOperacao={setDataOperacao}
                    tipoOperacaoId={tipoOperacaoId}
                    setTipoOperacaoId={setTipoOperacaoId}
                    tiposOperacao={tiposOperacao}
                    empresaCedente={empresaCedente}
                    setEmpresaCedente={setEmpresaCedente}
                />

                <AdicionarNotaFiscalForm 
                    novaNf={novaNf}
                    handleInputChange={handleInputChange}
                    handleAddNotaFiscal={handleAddNotaFiscal}
                    isLoading={isLoading}
                />

                <OperacaoDetalhes 
    notasFiscais={notasFiscais}
    descontos={descontos}
    totais={totais}
    handleSalvarOperacao={handleSalvarOperacao}
    handleLimparTudo={handleLimparTudo}
    isSaving={isSaving}
    onAddDescontoClick={() => setIsDescontoModalOpen(true)}
    onRemoveDesconto={handleRemoveDesconto}
    contasBancarias={contasBancarias}
    contaBancariaId={contaBancariaId}
    setContaBancariaId={setContaBancariaId}
/>

            </main>
        </>
    );
}