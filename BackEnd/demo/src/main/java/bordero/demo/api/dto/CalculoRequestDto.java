package bordero.demo.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CalculoRequestDto {
    @NotNull
    private LocalDate dataOperacao;
    @NotNull
    private LocalDate dataNf;
    @NotNull
    @Positive
    private BigDecimal valorNf;
    @NotNull
    private Long tipoOperacaoId; 
    @NotNull
    private String clienteSacado; 
    @NotNull
    private Integer parcelas;
    @NotNull
    private String prazos;
    private BigDecimal peso; 
}