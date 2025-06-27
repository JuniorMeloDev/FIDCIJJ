package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Total {
    @XmlElement(name = "ICMSTot", namespace = "http://www.portalfiscal.inf.br/nfe")
    private ICMSTot icmsTot;
}
