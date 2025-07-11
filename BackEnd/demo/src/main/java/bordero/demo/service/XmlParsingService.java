package bordero.demo.service;

import bordero.demo.api.dto.ClienteDto;
import bordero.demo.api.dto.NfeXmlDataDto;
import bordero.demo.api.dto.SacadoDto;
import bordero.demo.domain.entity.Cliente;
import bordero.demo.domain.entity.Sacado;
import bordero.demo.domain.repository.ClienteRepository;
import bordero.demo.domain.repository.SacadoRepository;
import bordero.demo.service.xml.model.NfeProc;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Unmarshaller;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XmlParsingService {

    private final ClienteRepository clienteRepository;
    private final SacadoRepository sacadoRepository;

    public NfeXmlDataDto parseNfe(MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            JAXBContext jaxbContext = JAXBContext.newInstance(NfeProc.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            
            NfeProc nfeProc = (NfeProc) jaxbUnmarshaller.unmarshal(inputStream);

            var infNfe = nfeProc.getNFe().getInfNFe();
            var emit = infNfe.getEmit();
            var dest = infNfe.getDest();

            // Verifica se o Cliente (Emitente) já existe
            Optional<Cliente> clienteOpt = clienteRepository.findByCnpj(emit.getCnpj());
            boolean emitenteExiste = clienteOpt.isPresent();

            // Monta o DTO do emitente com os dados do XML
            ClienteDto emitenteDto = ClienteDto.builder()
                .nome(emit.getXNome())
                .cnpj(emit.getCnpj())
                .build();
            
            // Verifica se o Sacado (Destinatário) já existe
            Optional<Sacado> sacadoOpt = sacadoRepository.findByCnpj(dest.getCnpj());
            boolean sacadoExiste = sacadoOpt.isPresent();

            // Monta o DTO do sacado com os dados do XML
            SacadoDto sacadoDto = SacadoDto.builder()
                .nome(dest.getXNome())
                .cnpj(dest.getCnpj())
                .ie(dest.getIE())
                .fone(dest.getEnderDest() != null ? dest.getEnderDest().getFone() : null)
                .cep(dest.getEnderDest() != null ? dest.getEnderDest().getCEP() : null)
                .endereco(dest.getEnderDest() != null ? dest.getEnderDest().getXLgr() : null)
                .bairro(dest.getEnderDest() != null ? dest.getEnderDest().getXBairro() : null)
                .municipio(dest.getEnderDest() != null ? dest.getEnderDest().getXMun() : null)
                .uf(dest.getEnderDest() != null ? dest.getEnderDest().getUF() : null)
                .build();


            return NfeXmlDataDto.builder()
                .numeroNf(infNfe.getIde().getNNF())
                .dataEmissao(LocalDate.parse(infNfe.getIde().getDhEmi().substring(0, 10)))
                .valorTotal(new BigDecimal(infNfe.getTotal().getIcmsTot().getVNF()))
                .parcelas(infNfe.getCobr() != null && infNfe.getCobr().getDup() != null ? 
                    infNfe.getCobr().getDup().stream().map(dup -> 
                        NfeXmlDataDto.ParcelaXmlDto.builder()
                            .numero(dup.getNDup())
                            .dataVencimento(LocalDate.parse(dup.getDVenc()))
                            .valor(new BigDecimal(dup.getVDup()))
                            .build()
                    ).collect(Collectors.toList()) : Collections.emptyList())
                .emitente(emitenteDto)
                .emitenteExiste(emitenteExiste)
                .sacado(sacadoDto)
                .sacadoExiste(sacadoExiste)
                .build();
        }
    }
}