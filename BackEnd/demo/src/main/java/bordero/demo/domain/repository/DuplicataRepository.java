package bordero.demo.domain.repository;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.domain.entity.Duplicata;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DuplicataRepository extends JpaRepository<Duplicata, Long>, JpaSpecificationExecutor<Duplicata> {

    @Query("SELECT new bordero.demo.api.dto.DashboardMetricsDto$RankingDto(d.clienteSacado, COALESCE(SUM(d.valorBruto), 0)) " +
           "FROM Duplicata d JOIN d.operacao o " +
           "WHERE d.dataOperacao >= :dataInicio AND d.dataOperacao <= :dataFim " +
           "AND (:clienteId IS NULL OR o.cliente.id = :clienteId) " +
           "AND (:sacado IS NULL OR d.clienteSacado = :sacado) " +
           "AND (:tipoOperacaoId IS NULL OR o.tipoOperacao.id = :tipoOperacaoId) " +
           "GROUP BY d.clienteSacado " +
           "HAVING COALESCE(SUM(d.valorBruto), 0) > 0 " +
           "ORDER BY SUM(d.valorBruto) DESC")
    List<DashboardMetricsDto.RankingDto> findTopSacadosByPeriodAndFilters(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("clienteId") Long clienteId,
            @Param("sacado") String sacado,
            @Param("tipoOperacaoId") Long tipoOperacaoId,
            Pageable pageable);

    @Query("SELECT SUM(d.valorJuros) FROM Duplicata d JOIN d.operacao o " +
           "WHERE d.dataOperacao >= :dataInicio AND d.dataOperacao <= :dataFim " +
           "AND (:clienteId IS NULL OR o.cliente.id = :clienteId) " +
           "AND (:sacado IS NULL OR d.clienteSacado LIKE %:sacado%) " +
           "AND (:tipoOperacaoId IS NULL OR o.tipoOperacao.id = :tipoOperacaoId)")
    Optional<BigDecimal> sumValorJurosByPeriodAndFilters(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("clienteId") Long clienteId,
            @Param("sacado") String sacado,
            @Param("tipoOperacaoId") Long tipoOperacaoId);
}