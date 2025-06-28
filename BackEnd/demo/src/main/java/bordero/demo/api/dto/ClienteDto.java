package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class ClienteDto {
    private Long id;
    private String nome;
    private String cnpj;
    private Set<SacadoDto> sacados;
}