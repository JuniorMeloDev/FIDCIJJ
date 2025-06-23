package bordero.demo.api.dto;

import bordero.demo.domain.entity.TipoOperacao;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class OperacaoRequestDto {
    private LocalDate dataOperacao;
    private TipoOperacao tipoOperacao;
    private String empresaCedente;
    private List<NotaFiscalDto> notasFiscais;
    private BigDecimal descontoAdicional;
}
