package bordero.demo.api.controller;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.TipoOperacao;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.domain.repository.TipoOperacaoRepository;
import bordero.demo.service.*;
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

import java.io.IOException;
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
    private final ExcelGenerationService excelGenerationService;
    private final ClienteRepository clienteRepository;
    private final TipoOperacaoRepository tipoOperacaoRepository;

    @GetMapping("/fluxo-caixa")
    public ResponseEntity<byte[]> gerarRelatorioFluxoCaixa(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) String conta,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String tipoValor,
            @RequestParam(defaultValue = "dataMovimento") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(defaultValue = "pdf") String format
    ) throws IOException {
        List<MovimentacaoCaixaResponseDto> movimentacoes = movimentacaoCaixaService.listarComFiltros(dataInicio, dataFim, descricao, conta, categoria, sort, direction, tipoValor);
        
        byte[] bytes;
        HttpHeaders headers = new HttpHeaders();
        
        if ("excel".equalsIgnoreCase(format)) {
            bytes = excelGenerationService.generateFluxoCaixaExcel(movimentacoes);
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "relatorio_fluxo_caixa.xlsx");
        } else {
            bytes = pdfGenerationService.generateFluxoCaixaPdf(movimentacoes, dataInicio, dataFim, conta, categoria);
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "relatorio_fluxo_caixa.pdf");
        }

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    @GetMapping("/duplicatas")
    public ResponseEntity<byte[]> gerarRelatorioDuplicatas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) Long tipoOperacaoId,
            @RequestParam(required = false) String sacado,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "pdf") String format
    ) throws IOException {
        List<DuplicataResponseDto> duplicatas = operacaoService.listarTodasAsDuplicatas(
            dataInicio, dataFim, null, null, sacado, null, null, status, 
            clienteId, tipoOperacaoId, "dataOperacao,nfCte", "ASC"
        );
        
        String clienteNome = clienteId != null ? clienteRepository.findById(clienteId).map(Cliente::getNome).orElse(null) : null;
        String tipoOperacaoNome = tipoOperacaoId != null ? tipoOperacaoRepository.findById(tipoOperacaoId).map(TipoOperacao::getNome).orElse(null) : null;

        byte[] bytes;
        HttpHeaders headers = new HttpHeaders();

        if ("excel".equalsIgnoreCase(format)) {
            bytes = excelGenerationService.generateDuplicatasExcel(duplicatas);
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "relatorio_duplicatas.xlsx");
        } else {
            bytes = pdfGenerationService.generateDuplicatasPdf(duplicatas, dataInicio, dataFim, clienteNome, tipoOperacaoNome, sacado, status);
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "relatorio_duplicatas.pdf");
        }

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    @GetMapping("/total-operado")
    public ResponseEntity<byte[]> gerarRelatorioTotalOperado(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) Long tipoOperacaoId,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String sacado,
            @RequestParam(required = false) String contaBancaria,
            @RequestParam(defaultValue = "pdf") String format
    ) throws IOException {
        DashboardMetricsDto metrics = dashboardService.getDashboardMetrics(dataInicio, dataFim, tipoOperacaoId, clienteId, sacado, contaBancaria, null);
        
        String clienteNome = clienteId != null ? clienteRepository.findById(clienteId).map(Cliente::getNome).orElse(null) : null;
        String tipoOperacaoNome = tipoOperacaoId != null ? tipoOperacaoRepository.findById(tipoOperacaoId).map(TipoOperacao::getNome).orElse(null) : null;
        
        byte[] bytes;
        HttpHeaders headers = new HttpHeaders();

        if ("excel".equalsIgnoreCase(format)) {
             bytes = excelGenerationService.generateTotalOperadoExcel(metrics);
             headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
             headers.setContentDispositionFormData("attachment", "relatorio_total_operado.xlsx");
        } else {
            bytes = pdfGenerationService.generateTotalOperadoPdf(metrics, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado);
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "relatorio_total_operado.pdf");
        }

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}