package bordero.demo.api.controller;

import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.service.OperacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/duplicatas")
@RequiredArgsConstructor
public class DuplicataController {

    private final OperacaoService operacaoService;

    @GetMapping
    public ResponseEntity<List<DuplicataResponseDto>> listarTudo() {
        List<DuplicataResponseDto> lista = operacaoService.listarTodasAsDuplicatas();
        return ResponseEntity.ok(lista);
    }
}
