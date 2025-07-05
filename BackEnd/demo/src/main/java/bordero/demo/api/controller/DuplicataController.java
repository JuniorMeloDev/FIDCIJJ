package bordero.demo.api.controller;

import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.service.OperacaoService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Void> liquidar(
        @PathVariable Long id, 
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataLiquidacao,
        @RequestParam(required = false) BigDecimal jurosMora // Parâmetro opcional adicionado
    ) {
        operacaoService.liquidarDuplicata(id, dataLiquidacao, jurosMora);
        return ResponseEntity.ok().build();
    }

     @PostMapping("/{id}/estornar")
    public ResponseEntity<Void> estornar(@PathVariable Long id) {
        operacaoService.estornarLiquidacao(id);
        return ResponseEntity.ok().build();
    }
}
