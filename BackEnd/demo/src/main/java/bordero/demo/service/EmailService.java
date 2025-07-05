package bordero.demo.service;

import bordero.demo.domain.entity.Operacao;
import bordero.demo.domain.entity.TipoOperacao;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.util.List;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfGenerationService pdfService;

    public void sendBorderoEmail(List<String> destinatarios, Operacao operacao) {
        if (destinatarios == null || destinatarios.isEmpty()) {
            log.warn("Nenhum destinatário fornecido para a operação ID: {}. O e-mail não será enviado.", operacao.getId());
            return;
        }

        try {
            log.info("A preparar e-mail com borderô para: {}", String.join(", ", destinatarios));

            byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Converte a lista para um array de strings para o MimeMessageHelper
            helper.setTo(destinatarios.toArray(new String[0]));

            // 1. Determina o prefixo e junta os números das NFs/Ctes
            String tipoDocumento = (operacao.getTipoOperacao() == TipoOperacao.IJJ_TRANSREC) ? "Cte" : "NF";
            String listaNumeros = operacao.getDuplicatas().stream()
                                      .map(d -> d.getNfCte().split("\\.")[0]) // Pega apenas o número principal
                                      .distinct()
                                      .collect(Collectors.joining(", "));

            // 2. Cria o assunto personalizado
            String assunto = "Borderô " + tipoDocumento + " " + listaNumeros;
            helper.setSubject(assunto);
            
            // 3. Cria o corpo do e-mail personalizado

            String emailBody = "<html>" +
                "<body style='font-family: Calibri, sans-serif; font-size: 11pt;'>" +
                "<p>Prezados,</p>" +
                "<p>Segue em anexo o borderô referente à " + tipoDocumento + " " + listaNumeros + ".</p>" +
                "<br/>" +
                "<p>Atenciosamente,</p>" +
                "<p>" +
                "<strong>Junior Melo</strong><br/>" +
                "Analista Financeiro<br/>" +
                "FIDC IJJ<br/>" +
                "(81) 9 7339-0292" +
                "</p>" +
                "<img src='https://1drv.ms/i/s!AkqLGeak4n5juuV0IwV4TtaEXOWGOQ?embed=1' width='140'>" +
                "</body></html>";
            
            helper.setText(emailBody, true);

            // --- FIM DA MODIFICAÇÃO ---

            helper.addAttachment("bordero-" + operacao.getId() + ".pdf", new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("E-mail com borderô enviado com sucesso para: {}", String.join(", ", destinatarios));

        } catch (Exception e) {
            log.error("Erro ao enviar o e-mail com o borderô.", e);
            throw new RuntimeException("Falha ao enviar o e-mail.", e);
        }
    }
}
