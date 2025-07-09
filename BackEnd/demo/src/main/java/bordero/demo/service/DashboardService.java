package bordero.demo.service;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MovimentacaoCaixaRepository movimentacaoCaixaRepository;

    @Transactional(readOnly = true)
    public List<SaldoContaDto> getSaldosPorConta() {
        return movimentacaoCaixaRepository.findSaldosPorConta();
    }

    @Transactional(readOnly = true)
public List<SaldoContaDto> getSaldosPorContaAteData(LocalDate data) {
    // Se a data não for fornecida, retorna o saldo atual
    if (data == null) {
        return getSaldosPorConta();
    }
    return movimentacaoCaixaRepository.findSaldosPorContaAteData(data);
}
}
