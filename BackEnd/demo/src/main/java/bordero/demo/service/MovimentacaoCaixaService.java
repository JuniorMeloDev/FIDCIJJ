package bordero.demo.service;

import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimentacaoCaixaService {

    private final MovimentacaoCaixaRepository repository;

    @Transactional(readOnly = true)
    public List<MovimentacaoCaixaResponseDto> listarTodas() {
        List<MovimentacaoCaixa> movimentacoes = repository.findAll(Sort.by(Sort.Direction.DESC, "dataMovimento"));
        return movimentacoes.stream()
                .map(this::converterParaDto)
                .collect(Collectors.toList());
    }

    private MovimentacaoCaixaResponseDto converterParaDto(MovimentacaoCaixa model) {
        return MovimentacaoCaixaResponseDto.builder()
                .id(model.getId())
                .dataMovimento(model.getDataMovimento())
                .descricao(model.getDescricao())
                .valor(model.getValor())
                .contaBancaria(model.getContaBancaria())
                .empresaAssociada(model.getEmpresaAssociada())
                .categoria(model.getCategoria())
                .build();
    }
}
