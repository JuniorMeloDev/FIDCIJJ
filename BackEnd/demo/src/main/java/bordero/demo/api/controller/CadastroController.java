package bordero.demo.api.controller;

import bordero.demo.api.dto.ClienteDto;
import bordero.demo.api.dto.SacadoDto;
import bordero.demo.service.CadastroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cadastros")
@RequiredArgsConstructor
public class CadastroController {

    private final CadastroService cadastroService;

    // --- Endpoints para Clientes (Cedentes) ---

    @PostMapping("/clientes")
    public ResponseEntity<ClienteDto> criarCliente(@Valid @RequestBody ClienteDto dto) {
        ClienteDto clienteCriado = cadastroService.criarCliente(dto);
        return new ResponseEntity<>(clienteCriado, HttpStatus.CREATED);
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteDto>> listarClientes() {
        List<ClienteDto> clientes = cadastroService.listarClientes();
        return ResponseEntity.ok(clientes);
    }

      @PutMapping("/clientes/{id}")
    public ResponseEntity<ClienteDto> atualizarCliente(@PathVariable Long id, @Valid @RequestBody ClienteDto dto) {
        ClienteDto clienteAtualizado = cadastroService.atualizarCliente(id, dto);
        return ResponseEntity.ok(clienteAtualizado);
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> excluirCliente(@PathVariable Long id) {
        cadastroService.excluirCliente(id);
        return ResponseEntity.noContent().build();
    }


    // --- Endpoints para Sacados (Devedores) ---

    @PostMapping("/sacados")
    public ResponseEntity<SacadoDto> criarSacado(@Valid @RequestBody SacadoDto dto) {
        SacadoDto sacadoCriado = cadastroService.criarSacado(dto);
        return new ResponseEntity<>(sacadoCriado, HttpStatus.CREATED);
    }

    @GetMapping("/sacados")
    public ResponseEntity<List<SacadoDto>> listarSacados() {
        List<SacadoDto> sacados = cadastroService.listarSacados();
        return ResponseEntity.ok(sacados);
    }

     @PutMapping("/sacados/{id}")
    public ResponseEntity<SacadoDto> atualizarSacado(@PathVariable Long id, @Valid @RequestBody SacadoDto dto) {
        SacadoDto sacadoAtualizado = cadastroService.atualizarSacado(id, dto);
        return ResponseEntity.ok(sacadoAtualizado);
    }

    @DeleteMapping("/sacados/{id}")
    public ResponseEntity<Void> excluirSacado(@PathVariable Long id) {
        cadastroService.excluirSacado(id);
        return ResponseEntity.noContent().build();
    }
}
