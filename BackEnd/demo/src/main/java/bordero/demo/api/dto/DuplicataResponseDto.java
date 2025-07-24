package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DuplicataResponseDto {
    private Long id;
    private Long operacaoId;
    private Long clienteId;
    private LocalDate dataOperacao;
    private String nfCte;
    private String empresaCedente;
    private BigDecimal valorBruto;
    private BigDecimal valorJuros;
    private String clienteSacado;
    private LocalDate dataVencimento;
    private String tipoOperacaoNome; 
    private String statusRecebimento;
    private LocalDate dataLiquidacao;
    private String contaLiquidacao;
}