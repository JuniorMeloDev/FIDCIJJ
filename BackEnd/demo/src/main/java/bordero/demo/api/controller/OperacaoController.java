package bordero.demo.api.controller;

import bordero.demo.api.dto.CalculoRequestDto;
import bordero.demo.api.dto.CalculoResponseDto;
import bordero.demo.api.dto.OperacaoRequestDto;
import bordero.demo.service.OperacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operacoes")
@RequiredArgsConstructor
public class OperacaoController {

    private final OperacaoService operacaoService;

    @PostMapping("/calcular-juros")
    public ResponseEntity<CalculoResponseDto> calcular(@Valid @RequestBody CalculoRequestDto request) {
        CalculoResponseDto response = operacaoService.calcularJuros(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/salvar")
    @ResponseStatus(HttpStatus.CREATED)
    public void salvarOperacao(@Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        operacaoService.salvarOperacao(operacaoRequestDto);
    }
}
