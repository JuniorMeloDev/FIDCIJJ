package bordero.demo.service.xml.model;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import lombok.Data;
import java.util.List;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Cobr {
    @XmlElement(name = "dup", namespace = "http://www.portalfiscal.inf.br/nfe")
    private List<Dup> dup;
}
