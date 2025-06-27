package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class NfeXmlDataDto {
    private String numeroNf;
    private String nomeEmitente;
    private String nomeDestinatario;
    private LocalDate dataEmissao;
    private BigDecimal valorTotal;
    private List<ParcelaXmlDto> parcelas;

    @Data
    @Builder
    public static class ParcelaXmlDto {
        private String numero;
        private LocalDate dataVencimento;
        private BigDecimal valor;
    }
}
