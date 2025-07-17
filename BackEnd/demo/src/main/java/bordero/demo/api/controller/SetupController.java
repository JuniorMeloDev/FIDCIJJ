package bordero.demo.api.controller;

import bordero.demo.api.dto.SetupStatusDto;
import bordero.demo.domain.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class SetupController {

    private final ClienteRepository clienteRepository;

    @GetMapping("/status")
    public ResponseEntity<SetupStatusDto> getSetupStatus() {
        // A configuração é necessária se a contagem de clientes for zero.
        boolean needsSetup = clienteRepository.count() == 0;
        return ResponseEntity.ok(new SetupStatusDto(needsSetup));
    }
}