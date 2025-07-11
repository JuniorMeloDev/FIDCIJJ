package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class NfeXmlDataDto {
    // Dados da Nota Fiscal
    private String numeroNf;
    private LocalDate dataEmissao;
    private BigDecimal valorTotal;
    private List<ParcelaXmlDto> parcelas;

    // Dados do Cliente (Emitente)
    private ClienteDto emitente;
    private boolean emitenteExiste;

    // Dados do Sacado (Destinatário)
    private SacadoDto sacado;
    private boolean sacadoExiste;

    @Data
    @Builder
    public static class ParcelaXmlDto {
        private String numero;
        private LocalDate dataVencimento;
        private BigDecimal valor;
    }
}