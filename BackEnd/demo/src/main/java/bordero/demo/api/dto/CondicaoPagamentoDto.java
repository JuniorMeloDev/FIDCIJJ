package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CondicaoPagamentoDto {
    private Long id;
    private Long tipoOperacaoId;
    private String tipoOperacaoNome;
    private BigDecimal taxaJuros;
    private String prazos;
}