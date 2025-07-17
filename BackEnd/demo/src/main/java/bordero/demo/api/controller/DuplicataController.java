package bordero.demo.api.controller;

import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.service.OperacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/duplicatas")
@RequiredArgsConstructor
public class DuplicataController {

    private final OperacaoService operacaoService;

    @GetMapping
    public ResponseEntity<List<DuplicataResponseDto>> listarTudo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataOpInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataOpFim,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencFim,
            @RequestParam(required = false) String sacado,
            @RequestParam(required = false) String nfCte,
            @RequestParam(required = false) BigDecimal valor,
            @RequestParam(required = false) String status
    ) {
        List<DuplicataResponseDto> lista = operacaoService.listarTodasAsDuplicatas(dataOpInicio, dataOpFim, dataVencInicio, dataVencFim, sacado, nfCte, valor, status);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{id}/liquidar")
    public ResponseEntity<DuplicataResponseDto> liquidar(
        @PathVariable Long id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataLiquidacao,
        @RequestParam(required = false) BigDecimal jurosMora,
        @RequestParam Long contaBancariaId // Este parâmetro será recebido na requisição
    ) {
        // A chamada para o serviço agora inclui o ID da conta bancária
        DuplicataResponseDto duplicataAtualizada = operacaoService.liquidarDuplicata(id, dataLiquidacao, jurosMora, contaBancariaId);
        return ResponseEntity.ok(duplicataAtualizada);
    }

    @PostMapping("/{id}/estornar")
    public ResponseEntity<Void> estornar(@PathVariable Long id) {
        operacaoService.estornarLiquidacao(id);
        return ResponseEntity.ok().build();
    }
}