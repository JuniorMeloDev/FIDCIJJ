'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AdicionarNotaFiscalForm from '@/app/components/AdicionarNotaFiscalForm';
import OperacaoDetalhes from '@/app/components/OperacaoDetalhes';
import OperacaoHeader from '@/app/components/OperacaoHeader';
import Notification from '@/app/components/Notification';
import DescontoModal from '@/app/components/DescontoModal';
import { formatBRLInput, parseBRL } from '@/app/utils/formatters';

const API_URL = 'http://localhost:8080/api';

export default function OperacaoBorderoPage() {
    const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().split('T')[0]);
    const [tipoOperacaoId, setTipoOperacaoId] = useState('');
    const [tiposOperacao, setTiposOperacao] = useState([]);
    const [empresaCedente, setEmpresaCedente] = useState('');
    const [novaNf, setNovaNf] = useState({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '', prazos: '' });
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [descontos, setDescontos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchTiposOperacao = async () => {
            try {
                const response = await fetch(`${API_URL}/cadastros/tipos-operacao`);
                if (!response.ok) throw new Error('Falha ao carregar tipos de operação.');
                setTiposOperacao(await response.json());
            } catch (error) {
                showNotification(error.message, 'error');
            }
        };
        fetchTiposOperacao();
    }, []);

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
    
    const handleAddNotaFiscal = (e) => {
        e.preventDefault();
        if (!tipoOperacaoId || !dataOperacao || !empresaCedente) {
            showNotification('Preencha os Dados da Operação (Data, Tipo e Cedente) primeiro.', 'error');
            return;
        }

        const nfParaAdicionar = {
            id: Date.now(),
            ...novaNf,
            valorNf: parseBRL(novaNf.valorNf),
            parcelas: parseInt(novaNf.parcelas) || 0,
        };
        setNotasFiscais([...notasFiscais, nfParaAdicionar]);
        setNovaNf({ nfCte: '', dataNf: '', valorNf: '', clienteSacado: '', parcelas: '', prazos: '' });
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
        setTipoOperacaoId('');
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
            tipoOperacaoId: parseInt(tipoOperacaoId),
            empresaCedente,
            descontos: descontos.map(d => ({ descricao: d.descricao, valor: d.valor })),
            notasFiscais: notasFiscais.map(nf => ({
                nfCte: nf.nfCte,
                dataNf: nf.dataNf,
                valorNf: nf.valorNf,
                clienteSacado: nf.clienteSacado,
                parcelas: nf.parcelas,
                prazos: nf.prazos
            })),
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
        // Como o cálculo de juros agora depende do sacado e do tipo,
        // ele é feito no backend. O frontend apenas soma os valores totais.
        const valorTotalBruto = notasFiscais.reduce((acc, nf) => acc + nf.valorNf, 0);
        // Aqui, precisaríamos que o backend retornasse os juros calculados para cada NF.
        // Por agora, vamos deixar como zero, pois a lógica final está no backend.
        const desagioTotal = 0;
        const totalOutrosDescontos = descontos.reduce((acc, d) => acc + d.valor, 0);
        const liquidoOperacao = valorTotalBruto - desagioTotal - totalOutrosDescontos;
        return { valorTotalBruto, desagioTotal, totalOutrosDescontos, liquidoOperacao };
    }, [notasFiscais, descontos]);

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <DescontoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDesconto} />
            
            <main className="p-4 sm:p-6 flex flex-col h-full">
                <header className="mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Criar Borderô</h1>
                        <p className="text-sm text-gray-600 mt-1">Preencha os dados abaixo ou importe um XML.</p>
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
                    onAddDescontoClick={() => setIsModalOpen(true)}
                    onRemoveDesconto={handleRemoveDesconto}
                />
            </main>
        </>
    );
}