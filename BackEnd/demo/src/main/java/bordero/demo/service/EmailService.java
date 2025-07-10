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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // --- Lógica do Nome do Ficheiro ---
            String tipoDocumento = "NF";
            if (operacao.getCliente() != null && "Transportes".equalsIgnoreCase(operacao.getCliente().getRamoDeAtividade())) {
                tipoDocumento = "Cte";
            }
            String prefixo = "Bordero " + tipoDocumento + " ";
            String numeros = operacao.getDuplicatas().stream()
                                  .map(duplicata -> duplicata.getNfCte().split("\\.")[0])
                                  .distinct()
                                  .collect(Collectors.joining(", "));
            String filename = (prefixo + numeros).trim() + ".pdf";
            // --- Fim da Lógica ---

            helper.setTo(to.toArray(new String[0]));
            helper.setSubject("Borderô de Operação - FIDC IJJ");
            helper.setText("Prezados,\n\nSegue em anexo o borderô referente à operação.\n\nAtenciosamente,\nFIDC IJJ");

            byte[] pdfBytes = pdfService.generateBorderoPdf(operacao);
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes));

            mailSender.send(message);

        } catch (MessagingException e) {
            // Lidar com a exceção de forma mais robusta em um ambiente de produção
            // (ex: logar o erro, tentar novamente, notificar um administrador)
            throw new RuntimeException("Falha ao enviar o e-mail com o borderô.", e);
        }
    }
}