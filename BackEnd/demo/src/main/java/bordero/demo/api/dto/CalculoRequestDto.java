package bordero.demo.api.dto;

import bordero.demo.domain.entity.TipoOperacao;
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
    private TipoOperacao tipoOperacao;
    @NotNull
    private Integer parcelas;
    @NotNull
    private String prazos;
    private BigDecimal peso;
}