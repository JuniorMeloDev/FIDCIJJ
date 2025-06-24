package bordero.demo.service;

import bordero.demo.api.dto.*;
import bordero.demo.domain.entity.*;
import bordero.demo.domain.repository.DescontoRepository;
import bordero.demo.domain.repository.DuplicataRepository;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import bordero.demo.domain.repository.OperacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OperacaoService {

    private final DuplicataRepository duplicataRepository;
    private final MovimentacaoCaixaRepository movimentacaoCaixaRepository;
    private final OperacaoRepository operacaoRepository;
    private final DescontoRepository descontoRepository;

    public CalculoResponseDto calcularJuros(CalculoRequestDto request) {
        BigDecimal valorTotal = request.getValorNf();
        int numParcelas = request.getParcelas();
        String[] prazosStr = request.getPrazos().split("/");
        
        BigDecimal totalJuros = BigDecimal.ZERO;
        List<ParcelaDto> parcelasCalculadas = new ArrayList<>();
        BigDecimal valorTotalParcelas = BigDecimal.ZERO;

        BigDecimal valorParcelaBase = valorTotal.divide(new BigDecimal(numParcelas), 2, RoundingMode.HALF_UP);

        for (int i = 0; i < prazosStr.length; i++) {
            BigDecimal jurosParcela;
            LocalDate dataVencimento;
            int prazoDias = Integer.parseInt(prazosStr[i].trim());

            switch (request.getTipoOperacao()) {
                case A_VISTA:
                    if (request.getPeso() == null || request.getPeso().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Peso é obrigatório para operações 'A VISTA'.");
                    }
                    BigDecimal taxaAVista;
                    if (prazoDias == 15 || prazoDias == 22) {
                        taxaAVista = new BigDecimal("0.15");
                    } else if (prazoDias == 10 || prazoDias == 16) {
                        taxaAVista = new BigDecimal("0.10");
                    } else {
                        taxaAVista = BigDecimal.ZERO;
                    }
                    jurosParcela = request.getPeso().multiply(taxaAVista).divide(new BigDecimal(numParcelas), 2, RoundingMode.HALF_UP);
                    dataVencimento = request.getDataOperacao().plusDays(prazoDias);
                    break;
                
                case IJJ:
                    LocalDate dataVencimentoBase = request.getDataNf().plusDays(prazoDias);
                    dataVencimento = proximoDiaUtil(dataVencimentoBase);
                    long diasCorridos = ChronoUnit.DAYS.between(request.getDataOperacao(), dataVencimento);
                    jurosParcela = valorParcelaBase
                                    .multiply(new BigDecimal("0.02"))
                                    .divide(new BigDecimal("30"), 10, RoundingMode.HALF_UP)
                                    .multiply(new BigDecimal(diasCorridos));
                    break;

                case IJJ_TRANSREC:
                    dataVencimento = request.getDataNf().plusDays(prazoDias);
                    jurosParcela = valorTotal
                                    .multiply(new BigDecimal("0.05"))
                                    .divide(new BigDecimal("30"), 10, RoundingMode.HALF_UP)
                                    .multiply(new BigDecimal(prazoDias));
                    break;
                
                default:
                    throw new IllegalArgumentException("Tipo de operação desconhecido: " + request.getTipoOperacao());
            }

            jurosParcela = jurosParcela.setScale(2, RoundingMode.HALF_UP);
            totalJuros = totalJuros.add(jurosParcela);
            
            valorTotalParcelas = valorTotalParcelas.add(valorParcelaBase);

            parcelasCalculadas.add(ParcelaDto.builder()
                .numeroParcela(i + 1)
                .dataVencimento(dataVencimento)
                .valorParcela(valorParcelaBase)
                .jurosParcela(jurosParcela)
                .build());
        }

        BigDecimal diferencaArredondamento = valorTotal.subtract(valorTotalParcelas);
        if (diferencaArredondamento.compareTo(BigDecimal.ZERO) != 0 && !parcelasCalculadas.isEmpty()) {
            ParcelaDto ultimaParcela = parcelasCalculadas.get(parcelasCalculadas.size() - 1);
            ultimaParcela.setValorParcela(ultimaParcela.getValorParcela().add(diferencaArredondamento));
        }
        
        BigDecimal valorLiquido;
        if(request.getTipoOperacao() == TipoOperacao.A_VISTA){
            valorLiquido = valorTotal;
        } else {
            valorLiquido = valorTotal.subtract(totalJuros);
        }

        return CalculoResponseDto.builder()
            .totalJuros(totalJuros)
            .valorLiquido(valorLiquido)
            .parcelasCalculadas(parcelasCalculadas)
            .build();
    }
    
    @Transactional
    public Long salvarOperacao(OperacaoRequestDto operacaoDto) {
        log.info("Processando salvamento da operação para a empresa: {}", operacaoDto.getEmpresaCedente());

        BigDecimal valorTotalOperacao = operacaoDto.getNotasFiscais().stream()
                .map(NotaFiscalDto::getValorNf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal jurosTotalOperacao = operacaoDto.getNotasFiscais().stream()
                .map(nf -> calcularJuros(criarCalculoRequest(operacaoDto, nf)).getTotalJuros())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDescontosAdicionais = BigDecimal.ZERO;
        if (operacaoDto.getDescontos() != null && !operacaoDto.getDescontos().isEmpty()) {
            totalDescontosAdicionais = operacaoDto.getDescontos().stream()
                .map(DescontoDto::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal valorLiquidoFinal;
        if (operacaoDto.getTipoOperacao() == TipoOperacao.A_VISTA) {
            valorLiquidoFinal = valorTotalOperacao.subtract(totalDescontosAdicionais);
        } else {
            valorLiquidoFinal = valorTotalOperacao.subtract(jurosTotalOperacao).subtract(totalDescontosAdicionais);
        }

        Operacao operacao = new Operacao();
        operacao.setDataOperacao(operacaoDto.getDataOperacao());
        operacao.setTipoOperacao(operacaoDto.getTipoOperacao());
        operacao.setEmpresaCedente(operacaoDto.getEmpresaCedente());
        operacao.setValorTotalBruto(valorTotalOperacao);
        operacao.setValorTotalJuros(jurosTotalOperacao);
        operacao.setValorTotalDescontos(totalDescontosAdicionais);
        operacao.setValorLiquido(valorLiquidoFinal);
        
        Operacao operacaoSalva = operacaoRepository.save(operacao);

        List<Duplicata> duplicatasList = new ArrayList<>();
        for (NotaFiscalDto nfDto : operacaoDto.getNotasFiscais()) {
            CalculoResponseDto calculoResult = calcularJuros(criarCalculoRequest(operacaoDto, nfDto));
            for (ParcelaDto parcela : calculoResult.getParcelasCalculadas()) {
                Duplicata duplicata = new Duplicata();
                duplicata.setDataOperacao(operacaoDto.getDataOperacao());
                duplicata.setNfCte(nfDto.getNfCte() + "." + parcela.getNumeroParcela());
                duplicata.setEmpresaCedente(operacaoDto.getEmpresaCedente());
                duplicata.setValorBruto(parcela.getValorParcela());
                duplicata.setValorJuros(parcela.getJurosParcela());
                duplicata.setClienteSacado(nfDto.getClienteSacado());
                duplicata.setDataVencimento(parcela.getDataVencimento());
                duplicata.setTipoOperacao(operacaoDto.getTipoOperacao());
                duplicata.setOperacao(operacaoSalva);
                duplicatasList.add(duplicata);
            }
        }
        duplicataRepository.saveAll(duplicatasList);

        if (operacaoDto.getDescontos() != null && !operacaoDto.getDescontos().isEmpty()) {
            List<Desconto> descontosList = new ArrayList<>();
            for (DescontoDto dto : operacaoDto.getDescontos()) {
                Desconto desconto = new Desconto();
                desconto.setDescricao(dto.getDescricao());
                desconto.setValor(dto.getValor());
                desconto.setOperacao(operacaoSalva);
                descontosList.add(desconto);
            }
            descontoRepository.saveAll(descontosList);
        }

        MovimentacaoCaixa movimentacao = new MovimentacaoCaixa();
        movimentacao.setDataMovimento(operacaoDto.getDataOperacao());
        movimentacao.setCategoria("Pagamento de Duplicata");
        movimentacao.setValor(valorLiquidoFinal.negate());
        
        String numerosNfCte = operacaoDto.getNotasFiscais().stream()
                .map(NotaFiscalDto::getNfCte)
                .collect(Collectors.joining(", "));
        String prefixoDescricao = (operacaoDto.getTipoOperacao() == TipoOperacao.IJJ_TRANSREC) ? "Borderô Cte " : "Borderô NF ";
        movimentacao.setDescricao(prefixoDescricao + numerosNfCte);
        
        switch (operacaoDto.getTipoOperacao()) {
            case IJJ:
                movimentacao.setContaBancaria("Itaú");
                movimentacao.setEmpresaAssociada("Recife");
                break;
            case IJJ_TRANSREC:
                movimentacao.setContaBancaria("Inter");
                movimentacao.setEmpresaAssociada("Transrec");
                break;
            case A_VISTA:
                movimentacao.setContaBancaria("BNB");
                movimentacao.setEmpresaAssociada("PE");
                break;
        }
        
        movimentacao.setOperacao(operacaoSalva);
        movimentacaoCaixaRepository.save(movimentacao);

        return operacaoSalva.getId();
    }
    
    private CalculoRequestDto criarCalculoRequest(OperacaoRequestDto operacaoDto, NotaFiscalDto nfDto) {
        CalculoRequestDto calculoRequest = new CalculoRequestDto();
        calculoRequest.setDataOperacao(operacaoDto.getDataOperacao());
        calculoRequest.setTipoOperacao(operacaoDto.getTipoOperacao());
        calculoRequest.setDataNf(nfDto.getDataNf());
        calculoRequest.setValorNf(nfDto.getValorNf());
        calculoRequest.setParcelas(nfDto.getParcelas());
        calculoRequest.setPrazos(nfDto.getPrazos());
        if (operacaoDto.getTipoOperacao() == TipoOperacao.A_VISTA) {
            calculoRequest.setPeso(nfDto.getPeso());
        }
        return calculoRequest;
    }
    
    @Transactional(readOnly = true)
    public Operacao buscarOperacaoPorId(Long id) {
        return operacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operação não encontrada com o ID: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<DuplicataResponseDto> listarTodasAsDuplicatas() {
        return duplicataRepository.findAll().stream()
                .map(this::converterParaDto)
                .collect(Collectors.toList());
    }

    private DuplicataResponseDto converterParaDto(Duplicata duplicata) {
        Long operacaoId = (duplicata.getOperacao() != null) ? duplicata.getOperacao().getId() : null;
        return DuplicataResponseDto.builder()
                .id(duplicata.getId())
                .operacaoId(operacaoId)
                .dataOperacao(duplicata.getDataOperacao())
                .nfCte(duplicata.getNfCte())
                .empresaCedente(duplicata.getEmpresaCedente())
                .valorBruto(duplicata.getValorBruto())
                .valorJuros(duplicata.getValorJuros())
                .clienteSacado(duplicata.getClienteSacado())
                .dataVencimento(duplicata.getDataVencimento())
                .tipoOperacao(duplicata.getTipoOperacao())
                .statusRecebimento(duplicata.getStatusRecebimento())
                .build();
    }
    
    private LocalDate proximoDiaUtil(LocalDate data) {
        DayOfWeek diaDaSemana = data.getDayOfWeek();
        if (diaDaSemana == DayOfWeek.SATURDAY) {
            return data.plusDays(2);
        } else if (diaDaSemana == DayOfWeek.SUNDAY) {
            return data.plusDays(1);
        }
        return data;
    }
}