package bordero.demo.domain.repository;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoCaixaRepository extends JpaRepository<MovimentacaoCaixa, Long> {

    /**
     * Consulta JPQL personalizada para calcular a soma de todos os 'valores'
     * agrupados por 'contaBancaria'. Retorna uma lista com o saldo de cada conta.
     */
    @Query("SELECT new bordero.demo.api.dto.SaldoContaDto(m.contaBancaria, SUM(m.valor)) " +
           "FROM MovimentacaoCaixa m GROUP BY m.contaBancaria")
    List<SaldoContaDto> findSaldosPorConta();
}
