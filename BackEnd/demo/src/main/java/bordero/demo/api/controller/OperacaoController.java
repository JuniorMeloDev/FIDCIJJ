package bordero.demo.api.controller;

import bordero.demo.api.dto.EmailRequestDto;
import bordero.demo.api.dto.OperacaoRequestDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.Operacao;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.service.EmailService;
import bordero.demo.service.OperacaoService;
import bordero.demo.service.PdfGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operacoes")
@RequiredArgsConstructor
public class OperacaoController {

    private final OperacaoService operacaoService;
    private final PdfGenerationService pdfService;
    private final EmailService emailService;
    private final ClienteRepository clienteRepository; // Repositório injetado

    /**
     * Endpoint para salvar uma nova operação de borderô.
     * A lógica de cálculo de juros agora é tratada internamente pelo OperacaoService.
     */
    @PostMapping("/salvar")
    public ResponseEntity<Long> salvarOperacao(@Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Long operacaoId = operacaoService.salvarOperacao(operacaoRequestDto);
        return new ResponseEntity<>(operacaoId, HttpStatus.CREATED);
    }

    /**
     * Endpoint para gerar o PDF de um borderô, com a nomeação baseada no ramo de atividade do cliente.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> gerarPdfBordero(@PathVariable Long id) {
        Operacao operacao = operacaoService.buscarOperacaoPorId(id);
        byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);

        // --- LÓGICA DO NOME DO FICHEIRO ATUALIZADA ---
        String tipoDocumento = "NF"; // Padrão é NF
        Optional<Cliente> clienteOpt = clienteRepository.findByNomeIgnoreCase(operacao.getEmpresaCedente());
        
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            if ("Transportes".equalsIgnoreCase(cliente.getRamoDeAtividade())) {
                tipoDocumento = "Cte";
            }
        }
        
        String prefixo = "Bordero " + tipoDocumento + " ";

        String numeros = operacao.getDuplicatas().stream()
                              .map(duplicata -> duplicata.getNfCte().split("\\.")[0])
                              .distinct()
                              .collect(Collectors.joining(", "));
    
        String filename = (prefixo + numeros).trim() + ".pdf";
        // --- FIM DA LÓGICA ATUALIZADA ---

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
    
    /**
     * Endpoint para enviar o PDF do borderô por e-mail.
     */
    @PostMapping("/{id}/enviar-email")
    public ResponseEntity<Void> enviarEmailBordero(@PathVariable Long id, @RequestBody EmailRequestDto payload) {
        if (payload.getDestinatarios() == null || payload.getDestinatarios().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Operacao operacao = operacaoService.buscarOperacaoPorId(id);
        emailService.sendBorderoEmail(payload.getDestinatarios(), operacao);
        
        return ResponseEntity.ok().build();
    }
}