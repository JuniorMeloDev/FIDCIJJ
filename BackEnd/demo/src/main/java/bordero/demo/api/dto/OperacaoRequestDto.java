package bordero.demo.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class OperacaoRequestDto {
    private LocalDate dataOperacao;
    private Long tipoOperacaoId;
    private String empresaCedente;
    private List<NotaFiscalDto> notasFiscais;
    private List<DescontoDto> descontos;
    private Long contaBancariaId;
}