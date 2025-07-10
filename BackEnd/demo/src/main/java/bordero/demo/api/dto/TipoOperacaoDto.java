package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class TipoOperacaoDto {
    private Long id;
    private String nome;
    private BigDecimal taxaJuros;
    private BigDecimal valorFixo;
    private BigDecimal despesasBancarias;
    private String descricao;
}