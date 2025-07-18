package bordero.demo.domain.repository;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // 1. Importe esta classe
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
// 2. Adicione ", JpaSpecificationExecutor<MovimentacaoCaixa>" aqui
public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long>, JpaSpecificationExecutor<MovimentacaoCaixa> {

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
           "FROM MovimentacaoCaixa m GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorConta();

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
       "FROM MovimentacaoCaixa m WHERE m.dataMovimento <= :data " +
       "GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorContaAteData(@Param("data") LocalDate data);

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
       "FROM MovimentacaoCaixa m WHERE m.dataMovimento >= :dataInicio AND m.dataMovimento <= :dataFim " +
       "GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorPeriodo(@Param("dataInicio") LocalDate dataInicio, @Param("dataFim") LocalDate dataFim);
}