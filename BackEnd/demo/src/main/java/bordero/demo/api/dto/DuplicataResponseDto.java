package bordero.demo.api.dto;

import bordero.demo.domain.entity.TipoOperacao;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DuplicataResponseDto {
    private Long id;
    private Long operacaoId;
    private LocalDate dataOperacao;
    private String nfCte;
    private String empresaCedente;
    private BigDecimal valorBruto;
    private BigDecimal valorJuros;
    private String clienteSacado;
    private LocalDate dataVencimento;
    private TipoOperacao tipoOperacao;
    private String statusRecebimento;
}