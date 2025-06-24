package bordero.demo.api.controller;

import bordero.demo.api.dto.SaldoContaDto;
import bordero.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService service;

    @GetMapping("/saldos")
    public ResponseEntity<List<SaldoContaDto>> getSaldos() {
        List<SaldoContaDto> saldos = service.getSaldosPorConta();
        return ResponseEntity.ok(saldos);
    }
}
