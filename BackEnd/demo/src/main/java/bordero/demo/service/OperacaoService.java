package bordero.demo.service;

import bordero.demo.api.dto.*;
import bordero.demo.domain.entity.*;
import bordero.demo.domain.entity.Duplicata_; // Necessário para a consulta com Specification
import bordero.demo.domain.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    private final SacadoRepository sacadoRepository;
    private final TipoOperacaoRepository tipoOperacaoRepository;
    private final ClienteRepository clienteRepository;

    @Transactional
    public Long salvarOperacao(OperacaoRequestDto operacaoDto) {
        log.info("Iniciando salvamento da operação para a empresa: {}", operacaoDto.getEmpresaCedente());

        TipoOperacao tipoOperacao = tipoOperacaoRepository.findById(operacaoDto.getTipoOperacaoId())
                .orElseThrow(() -> new RuntimeException("Tipo de Operação com ID " + operacaoDto.getTipoOperacaoId() + " não encontrado."));

        Cliente cliente = clienteRepository.findByNomeIgnoreCase(operacaoDto.getEmpresaCedente())
                .orElseThrow(() -> new RuntimeException("Cliente cedente não encontrado: " + operacaoDto.getEmpresaCedente()));

        BigDecimal valorTotalOperacao = BigDecimal.ZERO;
        BigDecimal jurosTotalOperacao = BigDecimal.ZERO;
        List<Duplicata> duplicatasParaSalvar = new ArrayList<>();

        for (NotaFiscalDto nfDto : operacaoDto.getNotasFiscais()) {
            valorTotalOperacao = valorTotalOperacao.add(nfDto.getValorNf());

            Sacado sacado = sacadoRepository.findByNomeIgnoreCase(nfDto.getClienteSacado())
                    .orElseThrow(() -> new RuntimeException("Sacado '" + nfDto.getClienteSacado() + "' não encontrado."));
            
            CondicaoPagamento condicao = sacado.getCondicoesPagamento().stream()
                    .filter(cp -> cp.getTipoOperacao().getId().equals(tipoOperacao.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Nenhuma condição de pagamento encontrada para o Sacado '" + sacado.getNome() + "' com o tipo de operação '" + tipoOperacao.getNome() + "'."));

            CalculoResponseDto calculoResult = calcularJurosComCondicao(operacaoDto.getDataOperacao(), nfDto, condicao);
            jurosTotalOperacao = jurosTotalOperacao.add(calculoResult.getTotalJuros());

            for (ParcelaDto parcela : calculoResult.getParcelasCalculadas()) {
                Duplicata duplicata = new Duplicata();
                duplicata.setDataOperacao(operacaoDto.getDataOperacao());
                duplicata.setNfCte(nfDto.getNfCte() + "." + parcela.getNumeroParcela());
                duplicata.setClienteSacado(nfDto.getClienteSacado());
                duplicata.setValorBruto(parcela.getValorParcela());
                duplicata.setValorJuros(parcela.getJurosParcela());
                duplicata.setDataVencimento(parcela.getDataVencimento());
                duplicata.setStatusRecebimento("Pendente");
                duplicatasParaSalvar.add(duplicata);
            }
        }
        
        BigDecimal totalDescontosAdicionais = operacaoDto.getDescontos() != null ? operacaoDto.getDescontos().stream()
                .map(DescontoDto::getValor).reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;
        
        BigDecimal valorLiquidoFinal = valorTotalOperacao.subtract(jurosTotalOperacao).subtract(totalDescontosAdicionais);

        Operacao operacao = new Operacao();
        operacao.setDataOperacao(operacaoDto.getDataOperacao());
        operacao.setTipoOperacao(tipoOperacao);
        operacao.setCliente(cliente);
        operacao.setValorTotalBruto(valorTotalOperacao);
        operacao.setValorTotalJuros(jurosTotalOperacao);
        operacao.setValorTotalDescontos(totalDescontosAdicionais);
        operacao.setValorLiquido(valorLiquidoFinal);
        
        Operacao operacaoSalva = operacaoRepository.save(operacao);

        duplicatasParaSalvar.forEach(dup -> dup.setOperacao(operacaoSalva));
        duplicataRepository.saveAll(duplicatasParaSalvar);

        if (operacaoDto.getDescontos() != null && !operacaoDto.getDescontos().isEmpty()) {
            List<Desconto> descontosList = operacaoDto.getDescontos().stream().map(dto -> {
                Desconto desconto = new Desconto();
                desconto.setDescricao(dto.getDescricao());
                desconto.setValor(dto.getValor());
                desconto.setOperacao(operacaoSalva);
                return desconto;
            }).collect(Collectors.toList());
            descontoRepository.saveAll(descontosList);
        }

        criarMovimentacaoDeSaida(operacaoSalva);

        return operacaoSalva.getId();
    }
    
    @Transactional(readOnly = true)
    public CalculoResponseDto calcularJuros(CalculoRequestDto request) {
        Sacado sacado = sacadoRepository.findByNomeIgnoreCase(request.getClienteSacado())
                .orElseThrow(() -> new RuntimeException("Sacado '" + request.getClienteSacado() + "' não encontrado."));

        TipoOperacao tipoOperacao = tipoOperacaoRepository.findById(request.getTipoOperacaoId())
                .orElseThrow(() -> new RuntimeException("Tipo de Operação com ID " + request.getTipoOperacaoId() + " não encontrado."));

        CondicaoPagamento condicao = sacado.getCondicoesPagamento().stream()
                .filter(cp -> cp.getTipoOperacao().getId().equals(tipoOperacao.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nenhuma condição de pagamento encontrada para o Sacado '" + sacado.getNome() + "' com o tipo de operação '" + tipoOperacao.getNome() + "'."));

        NotaFiscalDto nfDto = new NotaFiscalDto();
        nfDto.setValorNf(request.getValorNf());
        nfDto.setParcelas(request.getParcelas());
        nfDto.setDataNf(request.getDataNf());
        nfDto.setPrazos(request.getPrazos());

        return calcularJurosComCondicao(request.getDataOperacao(), nfDto, condicao);
    }
    
    private CalculoResponseDto calcularJurosComCondicao(LocalDate dataOperacao, NotaFiscalDto nf, CondicaoPagamento condicao) {
        BigDecimal valorTotal = nf.getValorNf();
        int numParcelas = nf.getParcelas();
        String[] prazosStr = nf.getPrazos().split("/");
        
        BigDecimal totalJuros = BigDecimal.ZERO;
        List<ParcelaDto> parcelasCalculadas = new ArrayList<>();
        BigDecimal valorTotalParcelas = BigDecimal.ZERO;
        BigDecimal valorParcelaBase = valorTotal.divide(new BigDecimal(numParcelas), 2, RoundingMode.HALF_UP);

        for (int i = 0; i < prazosStr.length; i++) {
            int prazoDias = Integer.parseInt(prazosStr[i].trim());
            LocalDate dataVencimentoBase = nf.getDataNf().plusDays(prazoDias);
            LocalDate dataVencimento = proximoDiaUtil(dataVencimentoBase);
            long diasCorridos = ChronoUnit.DAYS.between(dataOperacao, dataVencimento);
            
            BigDecimal jurosParcela = valorParcelaBase
                .multiply(condicao.getTaxaJuros().divide(new BigDecimal(100)))
                .divide(new BigDecimal("30"), 10, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(diasCorridos));

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

        BigDecimal valorLiquido = valorTotal.subtract(totalJuros);

        return CalculoResponseDto.builder()
            .totalJuros(totalJuros)
            .valorLiquido(valorLiquido)
            .parcelasCalculadas(parcelasCalculadas)
            .build();
    }
    
    private void criarMovimentacaoDeSaida(Operacao operacao) {
        MovimentacaoCaixa movimentacao = new MovimentacaoCaixa();
        movimentacao.setDataMovimento(operacao.getDataOperacao());
        movimentacao.setCategoria("Pagamento de Borderô");
        movimentacao.setValor(operacao.getValorLiquido().negate());
        
        String tipoDocumento = "NF";
        if (operacao.getCliente() != null && "Transportes".equalsIgnoreCase(operacao.getCliente().getRamoDeAtividade())) {
            tipoDocumento = "Cte";
        }
        String numeros = operacao.getDuplicatas().stream()
                              .map(duplicata -> duplicata.getNfCte().split("\\.")[0])
                              .distinct()
                              .collect(Collectors.joining(", "));
        movimentacao.setDescricao("Borderô " + tipoDocumento + " " + numeros);

        movimentacao.setContaBancaria("Itaú"); // Esta lógica pode ser aprimorada
        movimentacao.setEmpresaAssociada(operacao.getCliente().getNome());
        movimentacao.setOperacao(operacao);
        
        movimentacaoCaixaRepository.save(movimentacao);
    }
    
    @Transactional
    public DuplicataResponseDto liquidarDuplicata(Long duplicataId, LocalDate dataLiquidacao, BigDecimal jurosMora) {
        log.info("Iniciando liquidação da duplicata ID: {} com data {} e juros/mora de {}", duplicataId, dataLiquidacao, jurosMora);

        Duplicata duplicata = duplicataRepository.findById(duplicataId)
                .orElseThrow(() -> new RuntimeException("Duplicata com ID " + duplicataId + " não encontrada."));

        if (!"Pendente".equalsIgnoreCase(duplicata.getStatusRecebimento())) {
            log.warn("Duplicata ID: {} já está com o estado {}.", duplicataId, duplicata.getStatusRecebimento());
            return converterParaDto(duplicata);
        }

        if (dataLiquidacao != null) {
            BigDecimal valorFinalRecebimento = duplicata.getValorBruto();

            if (jurosMora != null && jurosMora.compareTo(BigDecimal.ZERO) > 0) {
                valorFinalRecebimento = valorFinalRecebimento.add(jurosMora);
            }

            MovimentacaoCaixa movimentacao = new MovimentacaoCaixa();
            movimentacao.setDataMovimento(dataLiquidacao);
            movimentacao.setValor(valorFinalRecebimento);
            movimentacao.setCategoria("Recebimento");
            
            String tipoDocumento = "NF";
            if (duplicata.getOperacao() != null && duplicata.getOperacao().getCliente() != null) {
                if ("Transportes".equalsIgnoreCase(duplicata.getOperacao().getCliente().getRamoDeAtividade())) {
                    tipoDocumento = "Cte";
                }
            }
            movimentacao.setDescricao("Recebimento " + tipoDocumento + " " + duplicata.getNfCte());
            movimentacao.setContaBancaria("Itaú"); 
            movimentacao.setEmpresaAssociada(duplicata.getOperacao().getCliente().getNome());

            MovimentacaoCaixa movimentacaoSalva = movimentacaoCaixaRepository.save(movimentacao);
            duplicata.setLiquidacaoMovId(movimentacaoSalva.getId());
            log.info("Movimentação de caixa ID: {} criada para o recebimento da duplicata ID: {}.", movimentacaoSalva.getId(), duplicataId);
        }

        duplicata.setStatusRecebimento("Recebido");
        Duplicata duplicataSalva = duplicataRepository.save(duplicata);
        log.info("Duplicata ID: {} atualizada para 'Recebido'.", duplicataId);
        
        return converterParaDto(duplicataSalva);
    }
    
    @Transactional
    public void estornarLiquidacao(Long duplicataId) {
        log.info("Iniciando estorno da liquidação para a duplicata ID: {}", duplicataId);
        
        Duplicata duplicata = duplicataRepository.findById(duplicataId)
                .orElseThrow(() -> new RuntimeException("Duplicata com ID " + duplicataId + " não encontrada."));

        if (!"Recebido".equalsIgnoreCase(duplicata.getStatusRecebimento())) {
            throw new IllegalStateException("Apenas duplicatas com estado 'Recebido' podem ser estornadas.");
        }

        if (duplicata.getLiquidacaoMovId() != null) {
            movimentacaoCaixaRepository.deleteById(duplicata.getLiquidacaoMovId());
            log.info("Movimentação de caixa ID: {} associada foi excluída.", duplicata.getLiquidacaoMovId());
        }

        duplicata.setStatusRecebimento("Pendente");
        duplicata.setLiquidacaoMovId(null);
        duplicataRepository.save(duplicata);
        log.info("Estorno da duplicata ID: {} concluído com sucesso.", duplicataId);
    }

    @Transactional(readOnly = true)
    public Operacao buscarOperacaoPorId(Long id) {
        return operacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operação não encontrada com o ID: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<DuplicataResponseDto> listarTodasAsDuplicatas(
            LocalDate dataOpInicio, LocalDate dataOpFim,
            LocalDate dataVencInicio, LocalDate dataVencFim,
            String sacado, String nfCte, BigDecimal valor, String status) {

        Specification<Duplicata> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dataOpInicio != null) predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(Duplicata_.dataOperacao), dataOpInicio));
            if (dataOpFim != null) predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(Duplicata_.dataOperacao), dataOpFim));
            if (dataVencInicio != null) predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(Duplicata_.dataVencimento), dataVencInicio));
            if (dataVencFim != null) predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(Duplicata_.dataVencimento), dataVencFim));
            if (sacado != null && !sacado.isBlank()) predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get(Duplicata_.clienteSacado)), "%" + sacado.toLowerCase() + "%"));
            if (nfCte != null && !nfCte.isBlank()) predicates.add(criteriaBuilder.like(root.get(Duplicata_.nfCte), "%" + nfCte + "%"));
            if (valor != null) predicates.add(criteriaBuilder.equal(root.get(Duplicata_.valorBruto), valor));
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("Todos")) predicates.add(criteriaBuilder.equal(root.get(Duplicata_.statusRecebimento), status));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.DESC, "dataOperacao");
        return duplicataRepository.findAll(spec, sort).stream()
                .map(this::converterParaDto)
                .collect(Collectors.toList());
    }

    private DuplicataResponseDto converterParaDto(Duplicata duplicata) {
        Long operacaoId = (duplicata.getOperacao() != null) ? duplicata.getOperacao().getId() : null;
        String tipoOperacaoNome = (duplicata.getOperacao() != null && duplicata.getOperacao().getTipoOperacao() != null) 
                                ? duplicata.getOperacao().getTipoOperacao().getNome() 
                                : null;
        String empresaCedente = (duplicata.getOperacao() != null && duplicata.getOperacao().getCliente() != null)
                                ? duplicata.getOperacao().getCliente().getNome()
                                : null;
        
        DuplicataResponseDto.DuplicataResponseDtoBuilder builder = DuplicataResponseDto.builder()
                .id(duplicata.getId())
                .operacaoId(operacaoId)
                .dataOperacao(duplicata.getDataOperacao())
                .nfCte(duplicata.getNfCte())
                .empresaCedente(empresaCedente)
                .valorBruto(duplicata.getValorBruto())
                .valorJuros(duplicata.getValorJuros())
                .clienteSacado(duplicata.getClienteSacado())
                .dataVencimento(duplicata.getDataVencimento())
                .tipoOperacaoNome(tipoOperacaoNome)
                .statusRecebimento(duplicata.getStatusRecebimento());

        if (duplicata.getLiquidacaoMovId() != null) {
            movimentacaoCaixaRepository.findById(duplicata.getLiquidacaoMovId()).ifPresent(mov -> {
                builder.dataLiquidacao(mov.getDataMovimento());
                builder.contaLiquidacao(mov.getContaBancaria());
            });
        }
        
        return builder.build();
    }
    
    private LocalDate proximoDiaUtil(LocalDate data) {
        DayOfWeek diaDaSemana = data.getDayOfWeek();
        if (diaDaSemana == DayOfWeek.SATURDAY) return data.plusDays(2);
        if (diaDaSemana == DayOfWeek.SUNDAY) return data.plusDays(1);
        return data;
    }
}