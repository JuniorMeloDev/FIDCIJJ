package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class InfNFe {
    @XmlElement(name = "ide", namespace = "http://www.portalfiscal.inf.br/nfe")
    private Ide ide;

    @XmlElement(name = "emit", namespace = "http://www.portalfiscal.inf.br/nfe")
    private Emit emit;

    @XmlElement(name = "dest", namespace = "http://www.portalfiscal.inf.br/nfe")
    private Dest dest;

    @XmlElement(name = "total", namespace = "http://www.portalfiscal.inf.br/nfe")
    private Total total;

    @XmlElement(name = "cobr", namespace = "http://www.portalfiscal.inf.br/nfe")
    private Cobr cobr;
}
