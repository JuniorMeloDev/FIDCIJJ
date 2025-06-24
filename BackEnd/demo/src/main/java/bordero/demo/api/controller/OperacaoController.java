package bordero.demo.api.controller;

import bordero.demo.api.dto.CalculoRequestDto;
import bordero.demo.api.dto.CalculoResponseDto;
import bordero.demo.api.dto.OperacaoRequestDto;
import bordero.demo.domain.entity.Operacao;
import bordero.demo.service.OperacaoService;
import bordero.demo.service.PdfGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operacoes")
@RequiredArgsConstructor
public class OperacaoController {

    private final OperacaoService operacaoService;
    private final PdfGenerationService pdfService;

    @PostMapping("/calcular-juros")
    public ResponseEntity<CalculoResponseDto> calcular(@Valid @RequestBody CalculoRequestDto request) {
        CalculoResponseDto response = operacaoService.calcularJuros(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para guardar uma operação de desconto completa.
     * Retorna o ID da operação criada.
     */
    @PostMapping("/salvar")
    public ResponseEntity<Long> salvarOperacao(@Valid @RequestBody OperacaoRequestDto operacaoRequestDto) {
        Long operacaoId = operacaoService.salvarOperacao(operacaoRequestDto);
        return new ResponseEntity<>(operacaoId, HttpStatus.CREATED);
    }

    /**
     * Endpoint para gerar o PDF do Borderô de uma operação específica.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> gerarPdfBordero(@PathVariable Long id) {
        Operacao operacao = operacaoService.buscarOperacaoPorId(id);
        byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "bordero-" + id + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
