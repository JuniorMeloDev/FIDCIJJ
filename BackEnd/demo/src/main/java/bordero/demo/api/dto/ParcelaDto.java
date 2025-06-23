package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ParcelaDto {
    private Integer numeroParcela;
    private BigDecimal valorParcela;
    private LocalDate dataVencimento;
    private BigDecimal jurosParcela; // Adicionado para carregar o juro individual
}
