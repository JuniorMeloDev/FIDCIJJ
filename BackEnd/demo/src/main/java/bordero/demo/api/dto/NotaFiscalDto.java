package bordero.demo.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class NotaFiscalDto {
    private String nfCte;
    private LocalDate dataNf;
    private BigDecimal valorNf;
    private String clienteSacado;
    private Integer parcelas;
    private String prazos;
    private BigDecimal peso;
}