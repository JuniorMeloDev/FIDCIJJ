package bordero.demo.service;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.entity.Duplicata;
import bordero.demo.domain.entity.Duplicata_;
import bordero.demo.domain.entity.Operacao;
import bordero.demo.domain.entity.Operacao_;
import bordero.demo.domain.repository.DuplicataRepository;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import bordero.demo.domain.repository.OperacaoRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MovimentacaoCaixaRepository movimentacaoCaixaRepository;
    private final OperacaoRepository operacaoRepository;
    private final DuplicataRepository duplicataRepository;
    private final OperacaoService operacaoService;

    @Transactional(readOnly = true)
    public List<SaldoContaDto> getSaldosPorConta() {
        return movimentacaoCaixaRepository.findSaldosPorConta();
    }

    @Transactional(readOnly = true)
    public List<SaldoContaDto> getSaldosPorContaAteData(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio != null && dataFim != null) {
            return movimentacaoCaixaRepository.findSaldosPorPeriodo(dataInicio, dataFim);
        }
        if (dataFim != null) {
            return movimentacaoCaixaRepository.findSaldosPorContaAteData(dataFim);
        }
        return getSaldosPorConta();
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getDashboardMetrics(LocalDate dataInicio, LocalDate dataFim, Long tipoOperacaoId, Long clienteId, String sacado) {
        LocalDate hoje = LocalDate.now();
        
        LocalDate inicioDoPeriodo = (dataInicio != null) ? dataInicio : hoje.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate fimDoPeriodo = (dataFim != null) ? dataFim : hoje.with(TemporalAdjusters.lastDayOfMonth());
        LocalDate vencimentosFim = hoje.plusDays(30);

        BigDecimal valorOperado = operacaoRepository
                .sumValorTotalBrutoByPeriodAndFilters(inicioDoPeriodo, fimDoPeriodo, tipoOperacaoId, clienteId)
                .orElse(BigDecimal.ZERO);

        // Chamada atualizada para incluir tipoOperacaoId
        List<DashboardMetricsDto.RankingDto> topClientes = operacaoRepository
                .findTopClientesByPeriodAndFilters(inicioDoPeriodo, fimDoPeriodo, clienteId, tipoOperacaoId, PageRequest.of(0, 5));

        // Chamada atualizada para incluir tipoOperacaoId
        List<DashboardMetricsDto.RankingDto> topSacados = duplicataRepository
                .findTopSacadosByPeriodAndFilters(inicioDoPeriodo, fimDoPeriodo, clienteId, sacado, tipoOperacaoId, PageRequest.of(0, 5));

        // ... (lógica da Specification para vencimentos permanece igual)
        Specification<Duplicata> specVencimentos = (root, query, cb) -> {
            Predicate p = cb.conjunction();
            p = cb.and(p, cb.equal(root.get(Duplicata_.statusRecebimento), "Pendente"));
            p = cb.and(p, cb.between(root.get(Duplicata_.dataVencimento), hoje, vencimentosFim));
            if (StringUtils.hasText(sacado)) {
                p = cb.and(p, cb.equal(root.get(Duplicata_.clienteSacado), sacado));
            }
            if (clienteId != null) {
                Join<Duplicata, Operacao> operacaoJoin = root.join(Duplicata_.operacao);
                p = cb.and(p, cb.equal(operacaoJoin.get(Operacao_.cliente).get("id"), clienteId));
            }
            // Adicionando filtro de tipo de operação também nos vencimentos
            if (tipoOperacaoId != null) {
                Join<Duplicata, Operacao> operacaoJoin = root.join(Duplicata_.operacao);
                p = cb.and(p, cb.equal(operacaoJoin.get(Operacao_.tipoOperacao).get("id"), tipoOperacaoId));
            }
            return p;
        };

        List<Duplicata> vencimentos = duplicataRepository.findAll(specVencimentos);
        List<DuplicataResponseDto> vencimentosDto = vencimentos.stream()
                .map(operacaoService::converterParaDto)
                .collect(Collectors.toList());

        return DashboardMetricsDto.builder()
                .valorOperadoNoMes(valorOperado)
                .topClientes(topClientes)
                .topSacados(topSacados)
                .vencimentosProximos(vencimentosDto)
                .build();
    }
}