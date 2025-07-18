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
    public List<SaldoContaDto> getSaldosPorContaAteData(LocalDate dataInicio, LocalDate dataFim) {
        // Se ambas as datas forem fornecidas, calcula o resultado do período
        if (dataInicio != null && dataFim != null) {
            return movimentacaoCaixaRepository.findSaldosPorPeriodo(dataInicio, dataFim);
        }
        // Se apenas a data final for fornecida, calcula o saldo acumulado até essa data
        if (dataFim != null) {
            return movimentacaoCaixaRepository.findSaldosPorContaAteData(dataFim);
        }
        // Se nenhuma data for fornecida, retorna o saldo total atual
        return getSaldosPorConta();
    }
}