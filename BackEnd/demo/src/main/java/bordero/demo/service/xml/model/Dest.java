package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Dest {
    @XmlElement(name = "xNome", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String xNome;

    @XmlElement(name = "CNPJ", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String cnpj;

    @XmlElement(name = "enderDest", namespace = "http://www.portalfiscal.inf.br/nfe")
    private EnderDest enderDest; // Campo adicionado

    @XmlElement(name = "IE", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String IE;
}
