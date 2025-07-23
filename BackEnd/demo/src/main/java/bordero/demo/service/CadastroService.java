package bordero.demo.service;

import bordero.demo.api.dto.ClienteDto;
import bordero.demo.api.dto.CondicaoPagamentoDto;
import bordero.demo.api.dto.ContaBancariaDto;
import bordero.demo.api.dto.SacadoDto;
import bordero.demo.api.dto.TipoOperacaoDto;
import bordero.demo.domain.entity.*;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.domain.repository.SacadoRepository;
import bordero.demo.domain.repository.TipoOperacaoRepository;
import bordero.demo.service.xml.model.Dest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CadastroService {

    private final ClienteRepository clienteRepository;
    private final SacadoRepository sacadoRepository;
    private final TipoOperacaoRepository tipoOperacaoRepository;

    // --- MÉTODOS PARA CLIENTES ---

    @Transactional
    public ClienteDto criarCliente(ClienteDto dto) {
        Cliente cliente = new Cliente();
        updateClienteFromDto(cliente, dto);
        Cliente clienteSalvo = clienteRepository.save(cliente);
        return toClienteDto(clienteSalvo);
    }

    @Transactional
    public ClienteDto atualizarCliente(Long id, ClienteDto dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente com ID " + id + " não encontrado."));
        updateClienteFromDto(cliente, dto);
        Cliente clienteAtualizado = clienteRepository.save(cliente);
        return toClienteDto(clienteAtualizado);
    }

    public Optional<Cliente> obterClienteMaster() {
        return clienteRepository.findAll(Sort.by("id").ascending())
                .stream()
                .findFirst();
    }

    
    private void updateClienteFromDto(Cliente cliente, ClienteDto dto) {
        cliente.setNome(dto.getNome());
        cliente.setCnpj(dto.getCnpj());
        cliente.setRamoDeAtividade(dto.getRamoDeAtividade());
        cliente.setEndereco(dto.getEndereco());
        cliente.setBairro(dto.getBairro());
        cliente.setMunicipio(dto.getMunicipio());
        cliente.setUf(dto.getUf());
        cliente.setFone(dto.getFone());
        cliente.setIe(dto.getIe());
        cliente.setCep(dto.getCep());

        if (cliente.getEmails() == null) {
            cliente.setEmails(new ArrayList<>());
        }
        cliente.getEmails().clear();
        if (dto.getEmails() != null) {
            // Remove e-mails vazios ou nulos antes de adicionar
            cliente.getEmails().addAll(
                dto.getEmails().stream()
                   .filter(email -> email != null && !email.trim().isEmpty())
                   .collect(Collectors.toList())
            );
        }

        if (cliente.getContasBancarias() == null) {
            cliente.setContasBancarias(new ArrayList<>());
        }
        cliente.getContasBancarias().clear();

        if (dto.getContasBancarias() != null) {
            dto.getContasBancarias().forEach(contaDto -> {
                ContaBancaria conta = new ContaBancaria();
                conta.setBanco(contaDto.getBanco());
                conta.setAgencia(contaDto.getAgencia());
                conta.setContaCorrente(contaDto.getContaCorrente());
                conta.setCliente(cliente);
                cliente.getContasBancarias().add(conta);
            });
        }
    }

    @Transactional
    public void excluirCliente(Long id) {
        clienteRepository.deleteById(id);
    }

    public List<ClienteDto> listarClientes() {
        return clienteRepository.findAll().stream()
                .map(this::toClienteDto)
                .collect(Collectors.toList());
    }
    
    // --- MÉTODOS PARA SACADOS ---

    @Transactional
    public SacadoDto criarSacado(SacadoDto dto) {
        Sacado sacado = new Sacado();
        updateSacadoFromDto(sacado, dto);
        Sacado sacadoSalvo = sacadoRepository.save(sacado);
        return toSacadoDto(sacadoSalvo);
    }

    @Transactional
    public SacadoDto atualizarSacado(Long id, SacadoDto dto) {
        Sacado sacado = sacadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sacado com ID " + id + " não encontrado."));
        updateSacadoFromDto(sacado, dto);
        Sacado sacadoAtualizado = sacadoRepository.save(sacado);
        return toSacadoDto(sacadoAtualizado);
    }

    private void updateSacadoFromDto(Sacado sacado, SacadoDto dto) {
        sacado.setNome(dto.getNome());
        sacado.setCnpj(dto.getCnpj());
        sacado.setEndereco(dto.getEndereco());
        sacado.setBairro(dto.getBairro());
        sacado.setMunicipio(dto.getMunicipio());
        sacado.setUf(dto.getUf());
        sacado.setFone(dto.getFone());
        sacado.setIe(dto.getIe());
        sacado.setCep(dto.getCep());

        if (sacado.getCondicoesPagamento() == null) {
            sacado.setCondicoesPagamento(new ArrayList<>());
        }
        sacado.getCondicoesPagamento().clear();

        if (dto.getCondicoesPagamento() != null) {
            dto.getCondicoesPagamento().forEach(condicaoDto -> {
                CondicaoPagamento condicao = new CondicaoPagamento();
                condicao.setParcelas(condicaoDto.getParcelas());
                condicao.setPrazos(condicaoDto.getPrazos());
                condicao.setSacado(sacado);
                sacado.getCondicoesPagamento().add(condicao);
            });
        }
    }

    @Transactional
    public void excluirSacado(Long id) {
        Sacado sacado = sacadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sacado com ID " + id + " não encontrado."));
        for (Cliente cliente : sacado.getClientes()) {
            cliente.getSacados().remove(sacado);
        }
        sacadoRepository.deleteById(id);
    }

    public List<SacadoDto> listarSacados() {
        return sacadoRepository.findAll().stream()
                .map(this::toSacadoDto)
                .collect(Collectors.toList());
    }

    // --- MÉTODOS PARA TIPOS DE OPERAÇÃO ---

    @Transactional
    public TipoOperacaoDto criarTipoOperacao(TipoOperacaoDto dto) {
        TipoOperacao tipoOperacao = new TipoOperacao();
        updateTipoOperacaoFromDto(tipoOperacao, dto);
        TipoOperacao salvo = tipoOperacaoRepository.save(tipoOperacao);
        return toTipoOperacaoDto(salvo);
    }

    @Transactional
    public TipoOperacaoDto atualizarTipoOperacao(Long id, TipoOperacaoDto dto) {
        TipoOperacao tipoOperacao = tipoOperacaoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tipo de Operação com ID " + id + " não encontrado."));
        updateTipoOperacaoFromDto(tipoOperacao, dto);
        TipoOperacao atualizado = tipoOperacaoRepository.save(tipoOperacao);
        return toTipoOperacaoDto(atualizado);
    }

    public List<TipoOperacaoDto> listarTiposOperacao() {
        return tipoOperacaoRepository.findAll().stream()
                .map(this::toTipoOperacaoDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void excluirTipoOperacao(Long id) {
        tipoOperacaoRepository.deleteById(id);
    }
    
    private void updateTipoOperacaoFromDto(TipoOperacao tipoOperacao, TipoOperacaoDto dto) {
        tipoOperacao.setNome(dto.getNome());
        tipoOperacao.setTaxaJuros(dto.getTaxaJuros());
        tipoOperacao.setValorFixo(dto.getValorFixo());
        tipoOperacao.setDespesasBancarias(dto.getDespesasBancarias());
        tipoOperacao.setDescricao(dto.getDescricao());
    }

    // --- MÉTODOS PARA O PROCESSAMENTO DE XML ---
    
    @Transactional
    public Cliente findOrCreateCliente(String nome, String cnpj) {
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
                .ramoDeAtividade(cliente.getRamoDeAtividade())
                .endereco(cliente.getEndereco())
                .bairro(cliente.getBairro())
                .municipio(cliente.getMunicipio())
                .uf(cliente.getUf())
                .fone(cliente.getFone())
                .ie(cliente.getIe())
                .cep(cliente.getCep())
                .contasBancarias(cliente.getContasBancarias() != null ?
                        cliente.getContasBancarias().stream().map(this::toContaBancariaDto).collect(Collectors.toList()) :
                        new ArrayList<>())
                .sacados(cliente.getSacados() != null ?
                        cliente.getSacados().stream().map(this::toSacadoDto).collect(Collectors.toSet()) :
                        new HashSet<>())
                .emails(cliente.getEmails())
                .build();
    }

    public ContaBancariaDto toContaBancariaDto(ContaBancaria conta) {
        return ContaBancariaDto.builder()
                .id(conta.getId())
                .banco(conta.getBanco())
                .agencia(conta.getAgencia())
                .contaCorrente(conta.getContaCorrente())
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
                .cep(sacado.getCep())
                .condicoesPagamento(sacado.getCondicoesPagamento() != null ?
                        sacado.getCondicoesPagamento().stream().map(this::toCondicaoPagamentoDto).collect(Collectors.toList()) :
                        new ArrayList<>())
                .build();
    }

    private CondicaoPagamentoDto toCondicaoPagamentoDto(CondicaoPagamento condicao) {
        return CondicaoPagamentoDto.builder()
                .id(condicao.getId())
                .parcelas(condicao.getParcelas())
                .prazos(condicao.getPrazos())
                .build();
    }
    
    private TipoOperacaoDto toTipoOperacaoDto(TipoOperacao tipoOperacao) {
        return TipoOperacaoDto.builder()
                .id(tipoOperacao.getId())
                .nome(tipoOperacao.getNome())
                .taxaJuros(tipoOperacao.getTaxaJuros())
                .valorFixo(tipoOperacao.getValorFixo())
                .despesasBancarias(tipoOperacao.getDespesasBancarias())
                .descricao(tipoOperacao.getDescricao())
                .build();
    }

    public List<ClienteDto> buscarClientesPorNome(String nome) {
    return clienteRepository.findByNomeContainingIgnoreCase(nome)
            .stream()
            .map(this::toClienteDto)
            .collect(Collectors.toList());
}

public List<SacadoDto> buscarSacadosPorNome(String nome) {
    return sacadoRepository.findByNomeContainingIgnoreCase(nome)
            .stream()
            .map(this::toSacadoDto)
            .collect(Collectors.toList());
}
}