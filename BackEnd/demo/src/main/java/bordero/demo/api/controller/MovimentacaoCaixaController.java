package bordero.demo.api.controller;

import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.service.MovimentacaoCaixaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes-caixa")
@RequiredArgsConstructor
public class MovimentacaoCaixaController {

    private final MovimentacaoCaixaService service;

    @GetMapping
    public ResponseEntity<List<MovimentacaoCaixaResponseDto>> listarTudo() {
        List<MovimentacaoCaixaResponseDto> lista = service.listarTodas();
        return ResponseEntity.ok(lista);
    }

     @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluirMovimentacao(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content, padrão para exclusão bem-sucedida
    }
}
