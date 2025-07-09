package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContaBancariaDto {
    private Long id;
    private String banco;
    private String agencia;
    private String contaCorrente;
}