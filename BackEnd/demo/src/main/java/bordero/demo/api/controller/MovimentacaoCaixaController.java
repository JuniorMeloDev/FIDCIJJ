package bordero.demo.api.controller;

import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.service.MovimentacaoCaixaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes-caixa")
@RequiredArgsConstructor
public class MovimentacaoCaixaController {

    private final MovimentacaoCaixaService service;

    @GetMapping
    public ResponseEntity<List<MovimentacaoCaixaResponseDto>> listarTudo(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
        @RequestParam(required = false) String descricao,
        @RequestParam(required = false) String conta,
        @RequestParam(required = false) String categoria,
        @RequestParam(required = false, defaultValue = "dataMovimento") String sort,
        @RequestParam(required = false, defaultValue = "DESC") String direction
    ) {
        // Passa os novos parâmetros para o serviço
        List<MovimentacaoCaixaResponseDto> lista = service.listarComFiltros(dataInicio, dataFim, descricao, conta, categoria, sort, direction);
        return ResponseEntity.ok(lista);
    }

     @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluirMovimentacao(id);
        return ResponseEntity.noContent().build();
    }
}