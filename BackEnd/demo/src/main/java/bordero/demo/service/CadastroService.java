package bordero.demo.service;

import bordero.demo.api.dto.ClienteDto;
import bordero.demo.api.dto.SacadoDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.Sacado;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.domain.repository.SacadoRepository;
import bordero.demo.service.xml.model.Dest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CadastroService {

    private final ClienteRepository clienteRepository;
    private final SacadoRepository sacadoRepository;

    // --- MÉTODOS PARA A TELA DE CADASTRO ---

    @Transactional
    public ClienteDto criarCliente(ClienteDto dto) {
        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setCnpj(dto.getCnpj());
        Cliente clienteSalvo = clienteRepository.save(cliente);
        return toClienteDto(clienteSalvo);
    }

    @Transactional
    public SacadoDto criarSacado(SacadoDto dto) {
        Sacado sacado = new Sacado();
        sacado.setNome(dto.getNome());
        sacado.setCnpj(dto.getCnpj());
        sacado.setEndereco(dto.getEndereco());
        sacado.setBairro(dto.getBairro());
        sacado.setMunicipio(dto.getMunicipio());
        sacado.setUf(dto.getUf());
        sacado.setFone(dto.getFone());
        sacado.setIe(dto.getIe());
        sacado.setCep(dto.getCep());
        Sacado sacadoSalvo = sacadoRepository.save(sacado);
        return toSacadoDto(sacadoSalvo);
    }

    public List<ClienteDto> listarClientes() {
        return clienteRepository.findAll().stream()
                .map(this::toClienteDto)
                .collect(Collectors.toList());
    }

    public List<SacadoDto> listarSacados() {
        return sacadoRepository.findAll().stream()
                .map(this::toSacadoDto)
                .collect(Collectors.toList());
    }

     @Transactional
    public ClienteDto atualizarCliente(Long id, ClienteDto dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente com ID " + id + " não encontrado."));
        
        cliente.setNome(dto.getNome());
        cliente.setCnpj(dto.getCnpj());
        
        Cliente clienteAtualizado = clienteRepository.save(cliente);
        return toClienteDto(clienteAtualizado);
    }

    @Transactional
    public SacadoDto atualizarSacado(Long id, SacadoDto dto) {
        Sacado sacado = sacadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sacado com ID " + id + " não encontrado."));

        sacado.setNome(dto.getNome());
        sacado.setCnpj(dto.getCnpj());
        sacado.setEndereco(dto.getEndereco());
        sacado.setBairro(dto.getBairro());
        sacado.setMunicipio(dto.getMunicipio());
        sacado.setUf(dto.getUf());
        sacado.setFone(dto.getFone());
        sacado.setIe(dto.getIe());
        sacado.setCep(dto.getCep());

        Sacado sacadoAtualizado = sacadoRepository.save(sacado);
        return toSacadoDto(sacadoAtualizado);
    }

    @Transactional
    public void excluirCliente(Long id) {
        // Adicionar verificação aqui se o cliente tem operações associadas antes de excluir
        clienteRepository.deleteById(id);
    }

    @Transactional
    public void excluirSacado(Long id) {
        // Adicionar verificação aqui se o sacado tem operações associadas antes de excluir
        sacadoRepository.deleteById(id);
    }

    // --- MÉTODOS PARA O PROCESSAMENTO DE XML ---

    @Transactional
    public Cliente findOrCreateCliente(String nome, String cnpj) {
        // Prioriza a busca por CNPJ, que é um identificador mais forte
        return clienteRepository.findByCnpj(cnpj)
                .orElseGet(() -> clienteRepository.findByNomeIgnoreCase(nome)
                        .orElseGet(() -> {
                            Cliente novoCliente = new Cliente();
                            novoCliente.setNome(nome);
                            novoCliente.setCnpj(cnpj);
                            return clienteRepository.save(novoCliente);
                        }));
    }

    @Transactional
    public Sacado findOrCreateSacado(Dest dest) {
        String cnpj = dest.getCnpj();
        String nome = dest.getXNome();

        return sacadoRepository.findByCnpj(cnpj)
                .orElseGet(() -> sacadoRepository.findByNomeIgnoreCase(nome)
                        .orElseGet(() -> {
                            Sacado novoSacado = new Sacado();
                            novoSacado.setNome(nome);
                            novoSacado.setCnpj(cnpj);
                            if (dest.getEnderDest() != null) {
                                novoSacado.setEndereco(dest.getEnderDest().getXLgr());
                                novoSacado.setBairro(dest.getEnderDest().getXBairro());
                                novoSacado.setMunicipio(dest.getEnderDest().getXMun());
                                novoSacado.setUf(dest.getEnderDest().getUF());
                                novoSacado.setFone(dest.getEnderDest().getFone());
                            }
                            novoSacado.setIe(dest.getIE());
                            return sacadoRepository.save(novoSacado);
                        }));
    }

    @Transactional
    public void linkClienteSacado(Cliente cliente, Sacado sacado) {
        if (cliente.getSacados() == null) {
            cliente.setSacados(new HashSet<>());
        }
        // O método .add() de um Set retorna 'true' se o item foi adicionado (ou seja, não existia antes)
        if (cliente.getSacados().add(sacado)) {
            clienteRepository.save(cliente);
        }
    }


    // --- CONVERSORES PARA DTO ---

    private ClienteDto toClienteDto(Cliente cliente) {
        return ClienteDto.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .cnpj(cliente.getCnpj())
                .sacados(cliente.getSacados() != null ?
                        cliente.getSacados().stream().map(this::toSacadoDto).collect(Collectors.toSet()) :
                        new HashSet<>())
                .build();
    }

    private SacadoDto toSacadoDto(Sacado sacado) {
        return SacadoDto.builder()
                .id(sacado.getId())
                .nome(sacado.getNome())
                .cnpj(sacado.getCnpj())
                .endereco(sacado.getEndereco())
                .bairro(sacado.getBairro())
                .municipio(sacado.getMunicipio())
                .uf(sacado.getUf())
                .fone(sacado.getFone())
                .ie(sacado.getIe())
                .build();
    }
}