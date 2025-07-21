package bordero.demo.api.controller;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.TipoOperacao;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.domain.repository.TipoOperacaoRepository;
import bordero.demo.service.DashboardService;
import bordero.demo.service.MovimentacaoCaixaService;
import bordero.demo.service.OperacaoService;
import bordero.demo.service.PdfGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final MovimentacaoCaixaService movimentacaoCaixaService;
    private final OperacaoService operacaoService;
    private final DashboardService dashboardService;
    private final PdfGenerationService pdfGenerationService;
    private final ClienteRepository clienteRepository;
    private final TipoOperacaoRepository tipoOperacaoRepository;


    @GetMapping("/fluxo-caixa")
    public ResponseEntity<byte[]> gerarRelatorioFluxoCaixa(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String conta,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "dataMovimento") String sort,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        List<MovimentacaoCaixaResponseDto> movimentacoes = movimentacaoCaixaService.listarComFiltros(dataInicio, dataFim, descricao, conta, categoria, sort, direction);
        byte[] pdfBytes = pdfGenerationService.generateFluxoCaixaPdf(movimentacoes, dataInicio, dataFim, conta, categoria);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio_fluxo_caixa.pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/duplicatas")
    public ResponseEntity<byte[]> gerarRelatorioDuplicatas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long tipoOperacaoId,
            @RequestParam(required = false) String sacado,
            @RequestParam(required = false) String status
    ) {
        // Adicionado "dataOperacao" e "DESC" como parâmetros de ordenação padrão para o relatório
        List<DuplicataResponseDto> duplicatas = operacaoService.listarTodasAsDuplicatas(dataInicio, dataFim, null, null, sacado, null, null, status, clienteId, tipoOperacaoId, "dataOperacao", "DESC");
        
        String clienteNome = clienteId != null ? clienteRepository.findById(clienteId).map(Cliente::getNome).orElse(null) : null;
        String tipoOperacaoNome = tipoOperacaoId != null ? tipoOperacaoRepository.findById(tipoOperacaoId).map(TipoOperacao::getNome).orElse(null) : null;

        byte[] pdfBytes = pdfGenerationService.generateDuplicatasPdf(duplicatas, dataInicio, dataFim, clienteNome, tipoOperacaoNome, sacado, status);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio_duplicatas.pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/total-operado")
    public ResponseEntity<byte[]> gerarRelatorioTotalOperado(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) Long tipoOperacaoId,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String sacado
    ) {
        DashboardMetricsDto metrics = dashboardService.getDashboardMetrics(dataInicio, dataFim, tipoOperacaoId, clienteId, sacado);

        String clienteNome = clienteId != null ? clienteRepository.findById(clienteId).map(Cliente::getNome).orElse(null) : null;
        String tipoOperacaoNome = tipoOperacaoId != null ? tipoOperacaoRepository.findById(tipoOperacaoId).map(TipoOperacao::getNome).orElse(null) : null;

        byte[] pdfBytes = pdfGenerationService.generateTotalOperadoPdf(metrics, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "relatorio_total_operado.pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}