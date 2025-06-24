package bordero.demo.api.dto;

import bordero.demo.domain.entity.TipoOperacao;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class OperacaoRequestDto {
    private LocalDate dataOperacao;
    private TipoOperacao tipoOperacao;
    private String empresaCedente;
    private List<NotaFiscalDto> notasFiscais;
    // Modificado para aceitar uma lista de descontos detalhados
    private List<DescontoDto> descontos;
}
