package bordero.demo.domain.repository;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.domain.entity.Operacao;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperacaoRepository extends JpaRepository<Operacao, Long> {
    
    @Query("SELECT SUM(o.valorTotalBruto) FROM Operacao o WHERE o.dataOperacao >= :dataInicio AND o.dataOperacao <= :dataFim " +
           "AND (:tipoOperacaoId IS NULL OR o.tipoOperacao.id = :tipoOperacaoId) " +
           "AND (:clienteId IS NULL OR o.cliente.id = :clienteId)")
    Optional<BigDecimal> sumValorTotalBrutoByPeriodAndFilters(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("tipoOperacaoId") Long tipoOperacaoId,
            @Param("clienteId") Long clienteId
    );

    @Query("SELECT new bordero.demo.api.dto.DashboardMetricsDto$RankingDto(c.nome, COALESCE(SUM(o.valorTotalBruto), 0)) " +
           "FROM Operacao o JOIN o.cliente c " +
           "WHERE o.dataOperacao >= :dataInicio AND o.dataOperacao <= :dataFim " +
           "AND (:clienteId IS NULL OR c.id = :clienteId) " +
           "AND (:tipoOperacaoId IS NULL OR o.tipoOperacao.id = :tipoOperacaoId) " +
           "GROUP BY c.nome " +
           "HAVING COALESCE(SUM(o.valorTotalBruto), 0) > 0 " +
           "ORDER BY SUM(o.valorTotalBruto) DESC")
    List<DashboardMetricsDto.RankingDto> findTopClientesByPeriodAndFilters(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("clienteId") Long clienteId,
            @Param("tipoOperacaoId") Long tipoOperacaoId,
            Pageable pageable
    );
}