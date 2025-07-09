package bordero.demo.domain.repository;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long> {

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
           "FROM MovimentacaoCaixa m GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorConta();

    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
       "FROM MovimentacaoCaixa m WHERE m.dataMovimento <= :data " +
       "GROUP BY m.contaBancaria")
List<SaldoContaDto> findSaldosPorContaAteData(@Param("data") LocalDate data);
}
