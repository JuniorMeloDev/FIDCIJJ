package bordero.demo.api.controller;

import bordero.demo.api.dto.ClienteDto;
import bordero.demo.api.dto.ContaBancariaDto;
import bordero.demo.api.dto.SacadoDto;
import bordero.demo.api.dto.TipoOperacaoDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.service.CadastroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional; 

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

    // --- Endpoints para Tipos de Operação ---

    @PostMapping("/tipos-operacao")
    public ResponseEntity<TipoOperacaoDto> criarTipoOperacao(@Valid @RequestBody TipoOperacaoDto dto) {
        TipoOperacaoDto tipoOperacaoCriada = cadastroService.criarTipoOperacao(dto);
        return new ResponseEntity<>(tipoOperacaoCriada, HttpStatus.CREATED);
    }

    @GetMapping("/tipos-operacao")
    public ResponseEntity<List<TipoOperacaoDto>> listarTiposOperacao() {
        List<TipoOperacaoDto> tipos = cadastroService.listarTiposOperacao();
        return ResponseEntity.ok(tipos);
    }

    @PutMapping("/tipos-operacao/{id}")
    public ResponseEntity<TipoOperacaoDto> atualizarTipoOperacao(@PathVariable Long id, @Valid @RequestBody TipoOperacaoDto dto) {
        TipoOperacaoDto tipoOperacaoAtualizada = cadastroService.atualizarTipoOperacao(id, dto);
        return ResponseEntity.ok(tipoOperacaoAtualizada);
    }

    @DeleteMapping("/tipos-operacao/{id}")
    public ResponseEntity<Void> excluirTipoOperacao(@PathVariable Long id) {
        cadastroService.excluirTipoOperacao(id);
        return ResponseEntity.noContent().build();
    }

    // --- Endpoint para Contas do Cliente Master ---

    @GetMapping("/contas/master")
    public ResponseEntity<List<ContaBancariaDto>> listarContasDoClienteMaster() {
        Optional<Cliente> masterOpt = cadastroService.obterClienteMaster(); // Agora chama o método que retorna Optional

        if (masterOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList()); // Retorna lista vazia se não houver cliente
        }

        Cliente master = masterOpt.get();
        List<ContaBancariaDto> contas = master.getContasBancarias().stream()
                .map(cadastroService::toContaBancariaDto)
                .toList();
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/clientes/search")
public ResponseEntity<List<ClienteDto>> buscarClientes(@RequestParam String nome) {
    return ResponseEntity.ok(cadastroService.buscarClientesPorNome(nome));
}

@GetMapping("/sacados/search")
public ResponseEntity<List<SacadoDto>> buscarSacados(@RequestParam String nome) {
    return ResponseEntity.ok(cadastroService.buscarSacadosPorNome(nome));
}
}