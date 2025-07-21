package bordero.demo.api.controller;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/saldos")
    public ResponseEntity<List<SaldoContaDto>> getSaldos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        List<SaldoContaDto> saldos = service.getSaldosPorContaAteData(dataInicio, dataFim);
        return ResponseEntity.ok(saldos);
    }
    
    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDto> getMetrics(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
        @RequestParam(required = false) Long tipoOperacaoId,
        @RequestParam(required = false) Long clienteId, 
        @RequestParam(required = false) String sacado  
    ) {
        DashboardMetricsDto metrics = service.getDashboardMetrics(dataInicio, dataFim, tipoOperacaoId, clienteId, sacado);
        return ResponseEntity.ok(metrics);
    }
}