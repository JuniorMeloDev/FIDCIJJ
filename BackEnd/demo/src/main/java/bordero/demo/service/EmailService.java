package bordero.demo.service;

import bordero.demo.domain.entity.Operacao;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfGenerationService pdfService;

    public void sendBorderoEmail(List<String> to, Operacao operacao) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String tipoDocumento = "NF";
            if (operacao.getCliente() != null && "Transportes".equalsIgnoreCase(operacao.getCliente().getRamoDeAtividade())) {
                tipoDocumento = "Cte";
            }
            
            String numeros = operacao.getDuplicatas().stream()
                                  .map(duplicata -> duplicata.getNfCte().split("\\.")[0])
                                  .distinct()
                                  .collect(Collectors.joining(", "));
            
            String subject = "Borderô " + tipoDocumento + " " + numeros;
            String filename = subject + ".pdf";

            helper.setTo(to.toArray(new String[0]));
            helper.setSubject(subject);

            // --- CORPO DO E-MAIL EM HTML ATUALIZADO ---
            // A tag <img> agora usa 'cid:logoImage' que funcionará como uma referência para a imagem anexada
            String emailBody = "<html>"
                + "<body>"
                + "<p>Prezados,</p>"
                + "<p>Segue em anexo o borderô referente à operação " + tipoDocumento + " " + numeros + ".</p>"
                + "<br/>"
                + "<p>Atenciosamente,</p>"
                + "<p>"
                + "<strong>Junior Melo</strong><br/>"
                + "Analista Financeiro<br/>"
                + "<strong>FIDC IJJ</strong><br/>"
                + "(81) 9 7339-0292"
                + "</p>"
                + "<img src='cid:logoImage' width='140'>" // Referência para a imagem inline
                + "</body>"
                + "</html>";
            
            helper.setText(emailBody, true);

            // Anexa o PDF do borderô
            byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes));

            // --- LÓGICA PARA INCORPORAR A LOGO NO E-MAIL ---
            try (InputStream imageStream = getClass().getClassLoader().getResourceAsStream("images/Logo.png")) {
                if (imageStream == null) {
                    throw new RuntimeException("Arquivo de logo não encontrado em 'resources/images/Logo.png'");
                }
                byte[] imageBytes = imageStream.readAllBytes();
                InputStreamSource imageSource = new ByteArrayResource(imageBytes);
                // Adiciona a imagem "inline" com um Content-ID (cid)
                helper.addInline("logoImage", imageSource, "image/png");
            } catch (Exception e) {
                System.err.println("Não foi possível carregar a imagem da logo para o e-mail: " + e.getMessage());
                // O e-mail ainda será enviado, mas sem a logo.
            }
            
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar o e-mail com o borderô.", e);
        }
    }
}