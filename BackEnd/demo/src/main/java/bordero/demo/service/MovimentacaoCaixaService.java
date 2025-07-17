package bordero.demo.service;

import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.MovimentacaoCaixa;
import bordero.demo.domain.entity.MovimentacaoCaixa_;
import bordero.demo.domain.repository.MovimentacaoCaixaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimentacaoCaixaService {

    private final MovimentacaoCaixaRepository repository;

    @Transactional(readOnly = true)
    public List<MovimentacaoCaixaResponseDto> listarComFiltros(LocalDate dataInicio, LocalDate dataFim, String descricao, String conta, String categoria, String sort, String direction) {
        
        Specification<MovimentacaoCaixa> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (dataInicio != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(MovimentacaoCaixa_.dataMovimento), dataInicio));
            }
            if (dataFim != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(MovimentacaoCaixa_.dataMovimento), dataFim));
            }
            if (StringUtils.hasText(descricao)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get(MovimentacaoCaixa_.descricao)), "%" + descricao.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(conta)) {
                predicates.add(criteriaBuilder.equal(root.get(MovimentacaoCaixa_.contaBancaria), conta));
            }
            if (StringUtils.hasText(categoria) && !"Todos".equalsIgnoreCase(categoria)) {
                predicates.add(criteriaBuilder.equal(root.get(MovimentacaoCaixa_.categoria), categoria));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sortOrder = Sort.by(sortDirection, sort);

        List<MovimentacaoCaixa> movimentacoes = repository.findAll(spec, sortOrder);
        
        return movimentacoes.stream()
                .map(this::converterParaDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void excluirMovimentacao(Long movimentacaoId) {
        MovimentacaoCaixa movimentacao = repository.findById(movimentacaoId)
                .orElseThrow(() -> new RuntimeException("Movimentação com ID " + movimentacaoId + " não encontrada."));

        if (movimentacao.getOperacao() != null) {
            throw new IllegalStateException("Não é permitido excluir uma movimentação que está ligada a uma operação de borderô.");
        }
        
        if ("Recebimento".equalsIgnoreCase(movimentacao.getCategoria())) {
             throw new IllegalStateException("Recebimentos de duplicatas devem ser estornados pela tela de Consultas, não excluídos.");
        }

        repository.deleteById(movimentacaoId);
    }

    // --- MÉTODO CORRIGIDO ---
    private MovimentacaoCaixaResponseDto converterParaDto(MovimentacaoCaixa model) {
        // Verifica se a operação associada não é nula antes de tentar aceder ao seu ID
        Long idOperacao = null;
        if (model.getOperacao() != null) {
            idOperacao = model.getOperacao().getId();
        }

        return MovimentacaoCaixaResponseDto.builder()
                .id(model.getId())
                .dataMovimento(model.getDataMovimento())
                .descricao(model.getDescricao())
                .valor(model.getValor())
                .contaBancaria(model.getContaBancaria())
                .empresaAssociada(model.getEmpresaAssociada())
                .categoria(model.getCategoria())
                .operacaoId(idOperacao) 
                .build();
    }
}