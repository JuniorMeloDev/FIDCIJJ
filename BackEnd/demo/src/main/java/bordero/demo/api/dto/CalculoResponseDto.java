package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CalculoResponseDto {
    private BigDecimal totalJuros;
    private BigDecimal valorLiquido;
    private List<ParcelaDto> parcelasCalculadas;
}