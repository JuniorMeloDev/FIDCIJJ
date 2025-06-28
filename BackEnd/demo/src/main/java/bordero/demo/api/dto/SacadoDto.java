package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SacadoDto {
    private Long id;
    private String nome;
    private String cnpj;
    private String endereco;
    private String bairro;
    private String municipio;
    private String uf;
    private String fone;
    private String ie;
    private String cep;
}