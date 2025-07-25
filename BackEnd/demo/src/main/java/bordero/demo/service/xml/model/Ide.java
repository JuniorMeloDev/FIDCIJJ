package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Ide {
    @XmlElement(name = "nNF", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String nNF;

    @XmlElement(name = "dhEmi", namespace = "http://www.portalfiscal.inf.br/nfe")
    private String dhEmi;
}
