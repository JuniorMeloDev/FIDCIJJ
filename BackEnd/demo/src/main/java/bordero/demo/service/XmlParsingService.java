package bordero.demo.service;

import bordero.demo.api.dto.NfeXmlDataDto;
import bordero.demo.service.xml.model.NfeProc;
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
public class XmlParsingService {

    public NfeXmlDataDto parseNfe(MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            JAXBContext jaxbContext = JAXBContext.newInstance(NfeProc.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            
            NfeProc nfeProc = (NfeProc) jaxbUnmarshaller.unmarshal(inputStream);

            var infNfe = nfeProc.getNFe().getInfNFe();

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