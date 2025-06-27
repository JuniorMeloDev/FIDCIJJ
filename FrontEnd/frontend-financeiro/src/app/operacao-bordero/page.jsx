'use client';

import { useState, useMemo, useRef } from 'react';
import AdicionarNotaFiscalForm from '@/app/components/AdicionarNotaFiscalForm';
import OperacaoDetalhes from '@/app/components/OperacaoDetalhes';
import OperacaoHeader from '@/app/components/OperacaoHeader';
import Notification from '@/app/components/Notification';
import DescontoModal from '@/app/components/DescontoModal';
import { formatBRLInput, parseBRL } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api';

export default function OperacaoBorderoPage() {
    const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0]);
    const [tipoOperacao, setTipoOperacao] = useState('');
    const [empresaCedente, setEmpresaCedente] = useState('');
    const [novaNf, setNovaNf] = useState({
        nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '', prazos: '', peso: '',
    });
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [descontos, setDescontos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const fileInputRef = useRef(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const handleXmlUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        showNotification("A processar XML...", "success");
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/upload/nfe-xml`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao ler o ficheiro XML.');
            }

            const data = await response.json();
            
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
                clienteSacado: data.nomeDestinatario || '',
                parcelas: data.parcelas ? String(data.parcelas.length) : '1',
                prazos: prazosString,
                peso: '',
            });
            setEmpresaCedente(data.nomeEmitente || '');
            showNotification("Dados da NF preenchidos com sucesso!", "success");

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddNotaFiscal = async (e) => {
        e.preventDefault();
        if (!tipoOperacao || !dataOperacao) {
            showNotification('Por favor, preencha a Data e o Tipo de Operação primeiro.', 'error');
            return;
        }
        setIsLoading(true);

        const valorNfFloat = parseBRL(novaNf.valorNf);
        const body = {
            dataOperacao,
            tipoOperacao,
            dataNf: novaNf.dataNf,
            valorNf: valorNfFloat,
            parcelas: parseInt(novaNf.parcelas) || 0,
            prazos: novaNf.prazos,
            peso: tipoOperacao === 'A_VISTA' ? parseFloat(novaNf.peso) : undefined,
        };

        try {
            const response = await fetch(`${API_URL}/operacoes/calcular-juros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Falha ao calcular os juros.');

            const calculoResult = await response.json();
            const nfParaAdicionar = {
                id: Date.now(),
                ...novaNf,
                valorNf: valorNfFloat,
                parcelas: parseInt(novaNf.parcelas) || 0,
                peso: tipoOperacao === 'A_VISTA' ? parseFloat(novaNf.peso) : undefined,
                jurosCalculado: calculoResult.totalJuros,
                valorLiquidoCalculado: calculoResult.valorLiquido,
            };

            setNotasFiscais([...notasFiscais, nfParaAdicionar]);
            setNovaNf({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '', prazos: '', peso: '' });
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

    const handleSaveDesconto = (novoDesconto) => {
        setDescontos([...descontos, novoDesconto]);
    };
    
    const handleRemoveDesconto = (id) => {
        setDescontos(descontos.filter(d => d.id !== id));
    };

    const handleLimparTudo = () => {
        setDataOperacao(new Date().toISOString().split('T')[0]);
        setTipoOperacao('');
        setEmpresaCedente('');
        setNotasFiscais([]);
        setDescontos([]);
        setNovaNf({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '', prazos: '', peso: '' });
        showNotification('Formulário limpo.', 'success');
    };

    const handleSalvarOperacao = async () => {
        if (notasFiscais.length === 0) {
            showNotification('Adicione pelo menos uma nota fiscal para guardar a operação.', 'error');
            return;
        }
        setIsSaving(true);
        
        const payload = {
            dataOperacao,
            tipoOperacao,
            empresaCedente,
            descontos: descontos.map(d => ({ descricao: d.descricao, valor: d.valor })),
            notasFiscais: notasFiscais.map(nf => ({
                nfCte: nf.nfCte,
                dataNf: nf.dataNf,
                valorNf: nf.valorNf,
                clienteSacado: nf.clienteSacado,
                parcelas: nf.parcelas,
                prazos: nf.prazos,
                peso: nf.peso,
            })),
        };

        try {
            const response = await fetch(`${API_URL}/operacoes/salvar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Ocorreu um erro ao guardar a operação.');

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
        const desagioTotal = notasFiscais.reduce((acc, nf) => acc + nf.jurosCalculado, 0);
        const totalOutrosDescontos = descontos.reduce((acc, d) => acc + d.valor, 0);

        let liquidoOperacao;
        if (tipoOperacao === 'A_VISTA') {
            liquidoOperacao = valorTotalBruto - totalOutrosDescontos;
        } else {
            liquidoOperacao = valorTotalBruto - desagioTotal - totalOutrosDescontos;
        }

        return { valorTotalBruto, desagioTotal, totalOutrosDescontos, liquidoOperacao };
    }, [notasFiscais, descontos, tipoOperacao]);

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <DescontoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDesconto} />
            
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Borderô de Operação</h1>
                        <p className="text-lg text-gray-600 mt-1">Preencha os dados abaixo ou importe um XML.</p>
                    </div>
                    <div>
                        <input
                            type="file"
                            accept=".xml"
                            ref={fileInputRef}
                            onChange={handleXmlUpload}
                            style={{ display: 'none' }}
                            id="xml-upload-input"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-gray-800"
                        >
                            Importar NF-e (XML)
                        </button>
                    </div>
                </header>

                <OperacaoHeader 
                    dataOperacao={dataOperacao}
                    setDataOperacao={setDataOperacao}
                    tipoOperacao={tipoOperacao}
                    setTipoOperacao={setTipoOperacao}
                    empresaCedente={empresaCedente}
                    setEmpresaCedente={setEmpresaCedente}
                />

                <AdicionarNotaFiscalForm 
                    novaNf={novaNf}
                    handleInputChange={handleInputChange}
                    handleAddNotaFiscal={handleAddNotaFiscal}
                    tipoOperacao={tipoOperacao}
                    isLoading={isLoading}
                />

                <OperacaoDetalhes 
                    notasFiscais={notasFiscais}
                    descontos={descontos}
                    totais={totais}
                    handleSalvarOperacao={handleSalvarOperacao}
                    handleLimparTudo={handleLimparTudo}
                    isSaving={isSaving}
                    onAddDescontoClick={() => setIsModalOpen(true)}
                    onRemoveDesconto={handleRemoveDesconto}
                />
            </main>
        </>
    );
}