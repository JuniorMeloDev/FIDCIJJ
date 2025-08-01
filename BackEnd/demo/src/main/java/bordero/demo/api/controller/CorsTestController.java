package bordero.demo.api.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class CorsTestController {

    @CrossOrigin(origins = "*") // 🔥 Libera tudo só pra teste!
    @GetMapping("/api/test-cors")
    public ResponseEntity<String> testCors() {
        return ResponseEntity.ok("✅ CORS está funcionando!");
    }
}