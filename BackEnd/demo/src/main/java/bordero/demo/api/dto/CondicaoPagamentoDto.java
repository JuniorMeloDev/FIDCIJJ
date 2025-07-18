package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CondicaoPagamentoDto {
    private Long id;
    private Integer parcelas;
    private String prazos;
}