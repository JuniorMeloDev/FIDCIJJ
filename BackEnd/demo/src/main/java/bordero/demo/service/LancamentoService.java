package bordero.demo.service;

import bordero.demo.api.dto.LancamentoRequestDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class LancamentoService {

    private final MovimentacaoCaixaRepository movimentacaoCaixaRepository;

    @Transactional
    public void criarLancamento(LancamentoRequestDto dto) {
        switch (dto.getTipo().toUpperCase()) {
            case "DEBITO":
                criarMovimentacao(dto.getData(), dto.getDescricao(), dto.getValor().negate(), dto.getContaOrigem(), dto.getEmpresaAssociada(), "Despesa Avulsa");
                break;
            case "CREDITO":
                criarMovimentacao(dto.getData(), dto.getDescricao(), dto.getValor(), dto.getContaOrigem(), dto.getEmpresaAssociada(), "Receita Avulsa");
                break;
            case "TRANSFERENCIA":
                // Lançamento de saída da conta de origem (usa a empresaAssociada)
                criarMovimentacao(dto.getData(), "Transf. para " + dto.getContaDestino(), dto.getValor().negate(), dto.getContaOrigem(), dto.getEmpresaAssociada(), "Transferencia Enviada");
                
                // --- INÍCIO DA CORREÇÃO ---
                // Lançamento de entrada na conta de destino (agora usa a empresaDestino)
                criarMovimentacao(dto.getData(), "Transf. de " + dto.getContaOrigem(), dto.getValor(), dto.getContaDestino(), dto.getEmpresaDestino(), "Transferencia Recebida");
                // --- FIM DA CORREÇÃO ---
                break;
            default:
                throw new IllegalArgumentException("Tipo de lançamento inválido: " + dto.getTipo());
        }
    }

    private void criarMovimentacao(LocalDate data, String descricao, BigDecimal valor, String conta, String empresa, String categoria) {
        MovimentacaoCaixa movimentacao = new MovimentacaoCaixa();
        movimentacao.setDataMovimento(data);
        movimentacao.setDescricao(descricao);
        movimentacao.setValor(valor);
        movimentacao.setContaBancaria(conta);
        movimentacao.setEmpresaAssociada(empresa);
        movimentacao.setCategoria(categoria);
        movimentacaoCaixaRepository.save(movimentacao);
    }
}
