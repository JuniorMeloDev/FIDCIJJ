package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Dup {
    @XmlElement(name = "nDup", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String nDup;

    @XmlElement(name = "dVenc", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String dVenc;

    @XmlElement(name = "vDup", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String vDup;
}
