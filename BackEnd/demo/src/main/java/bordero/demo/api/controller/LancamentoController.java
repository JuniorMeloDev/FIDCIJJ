package bordero.demo.api.controller;

import bordero.demo.api.dto.LancamentoRequestDto;
import bordero.demo.service.LancamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lancamentos")
@RequiredArgsConstructor
public class LancamentoController {

    private final LancamentoService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void criar(@Valid @RequestBody LancamentoRequestDto dto) {
        service.criarLancamento(dto);
    }
}
