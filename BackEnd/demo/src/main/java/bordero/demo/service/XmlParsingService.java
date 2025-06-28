package bordero.demo.service;

import bordero.demo.api.dto.NfeXmlDataDto;
import bordero.demo.service.xml.model.NfeProc;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.Sacado;
import lombok.RequiredArgsConstructor;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XmlParsingService {

    private final CadastroService cadastroService;

    public NfeXmlDataDto parseNfe(MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            JAXBContext jaxbContext = JAXBContext.newInstance(NfeProc.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            
            NfeProc nfeProc = (NfeProc) jaxbUnmarshaller.unmarshal(inputStream);

            var infNfe = nfeProc.getNFe().getInfNFe();
            var emitente = infNfe.getEmit();
            var destinatario = infNfe.getDest();

            Cliente cliente = cadastroService.findOrCreateCliente(emitente.getXNome(), emitente.getCnpj());

            Sacado sacado = cadastroService.findOrCreateSacado(destinatario);

            cadastroService.linkClienteSacado(cliente, sacado);

            return NfeXmlDataDto.builder()
                .numeroNf(infNfe.getIde().getNNF())
                .nomeEmitente(infNfe.getEmit().getXNome())
                .nomeDestinatario(infNfe.getDest().getXNome())
                .dataEmissao(LocalDate.parse(infNfe.getIde().getDhEmi(), DateTimeFormatter.ISO_OFFSET_DATE_TIME))
                .valorTotal(new BigDecimal(infNfe.getTotal().getIcmsTot().getVNF()))
                .parcelas(infNfe.getCobr() != null && infNfe.getCobr().getDup() != null ? 
                    infNfe.getCobr().getDup().stream().map(dup -> 
                        NfeXmlDataDto.ParcelaXmlDto.builder()
                            .numero(dup.getNDup())
                            .dataVencimento(LocalDate.parse(dup.getDVenc()))
                            .valor(new BigDecimal(dup.getVDup()))
                            .build()
                    ).collect(Collectors.toList()) : Collections.emptyList())
                .build();
        }
    }
}