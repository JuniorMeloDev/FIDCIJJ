package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class EnderDest {
    @XmlElement(name = "xLgr", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String xLgr; // Endereço

    @XmlElement(name = "xBairro", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String xBairro;

    @XmlElement(name = "xMun", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String xMun; // Município

    @XmlElement(name = "UF", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String UF;

    @XmlElement(name = "CEP", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String CEP;

    @XmlElement(name = "fone", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String fone;
}
