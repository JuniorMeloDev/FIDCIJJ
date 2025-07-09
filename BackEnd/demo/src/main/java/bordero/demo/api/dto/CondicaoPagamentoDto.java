package bordero.demo.api.dto;

import bordero.demo.domain.entity.TipoOperacao;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CondicaoPagamentoDto {
    private Long id;
    private TipoOperacao tipoOperacao;
    private BigDecimal taxaJuros;
    private String prazos;
}