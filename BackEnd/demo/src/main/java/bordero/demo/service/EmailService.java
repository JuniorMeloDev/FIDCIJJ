package bordero.demo.service;

import bordero.demo.domain.entity.Operacao;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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
            // O segundo argumento 'true' ativa o modo multipart, necessário para HTML e anexos
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // --- LÓGICA DO NOME DO FICHEIRO E DO ASSUNTO DO E-MAIL ---
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
            // --- FIM DA LÓGICA ---

            helper.setTo(to.toArray(new String[0]));
            helper.setSubject(subject); // Define o assunto do e-mail

            // --- CORPO DO E-MAIL EM HTML COM ASSINATURA ---
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
                + "<img src= 'https://1drv.ms/i/s!AkqLGeak4n5juuV0IwV4TtaEXOWGOQ?embed=1' width='140'>"
                + "</body>"
                + "</html>";
            
            // O segundo argumento 'true' para setText indica que o conteúdo é HTML
            helper.setText(emailBody, true);
            // --- FIM DO CORPO DO E-MAIL ---

            byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes));

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar o e-mail com o borderô.", e);
        }
    }
}