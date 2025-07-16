package bordero.demo.api.dto;

import bordero.demo.domain.entity.ContaBancaria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContaBancariaDto {
    private Long id;
    private String banco;
    private String agencia;
    private String contaCorrente;

    public static ContaBancariaDto fromEntity(ContaBancaria conta) {
        ContaBancariaDto dto = new ContaBancariaDto();
        dto.setId(conta.getId());
        dto.setBanco(conta.getBanco());
        dto.setAgencia(conta.getAgencia());
        dto.setContaCorrente(conta.getContaCorrente());
        return dto;
    }
}
