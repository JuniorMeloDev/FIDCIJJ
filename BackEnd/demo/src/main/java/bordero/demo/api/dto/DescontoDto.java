package bordero.demo.api.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DescontoDto {
    private String descricao;
    private BigDecimal valor;
}