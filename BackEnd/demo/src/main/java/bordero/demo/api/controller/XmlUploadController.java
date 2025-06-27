package bordero.demo.api.controller;

import bordero.demo.api.dto.NfeXmlDataDto;
import bordero.demo.service.XmlParsingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class XmlUploadController {

    private final XmlParsingService xmlParsingService;

    @PostMapping("/nfe-xml")
    public ResponseEntity<?> uploadNfeXml(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Por favor, selecione um ficheiro para fazer o upload.");
        }
        try {
            NfeXmlDataDto data = xmlParsingService.parseNfe(file);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao processar o ficheiro XML: " + e.getMessage());
        }
    }
}
