package bordero.demo.domain.repository;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
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
public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long>, JpaSpecificationExecutor<MovimentacaoCaixa> {

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
           "FROM MovimentacaoCaixa m GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorConta();
    
    @Query("SELECT DISTINCT m.contaBancaria FROM MovimentacaoCaixa m ORDER BY m.contaBancaria")
    List<String> findAllDistinctContasBancarias();

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
       "FROM MovimentacaoCaixa m WHERE m.dataMovimento <= :data " +
       "AND (:contaBancaria IS NULL OR m.contaBancaria = :contaBancaria) " +
       "GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorContaAteData(@Param("data") LocalDate data, @Param("contaBancaria") String contaBancaria);

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
       "FROM MovimentacaoCaixa m WHERE m.dataMovimento >= :dataInicio AND m.dataMovimento <= :dataFim " +
       "AND (:contaBancaria IS NULL OR m.contaBancaria = :contaBancaria) " +
       "GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorPeriodo(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim, @Param("contaBancaria") String contaBancaria);
    
    @Query("SELECT SUM(m.valor) FROM MovimentacaoCaixa m " +
           "WHERE m.dataMovimento >= :dataInicio AND m.dataMovimento <= :dataFim " +
           "AND m.valor < 0 AND m.categoria NOT IN ('Pagamento de Borderô', 'Transferencia Enviada') " +
           "AND (:contaBancaria IS NULL OR m.contaBancaria = :contaBancaria)")
    Optional<BigDecimal> sumDespesasByPeriodAndFilters(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim, @Param("contaBancaria") String contaBancaria);
}