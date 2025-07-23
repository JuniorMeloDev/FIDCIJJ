package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Data
@Builder
public class ClienteDto {
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
    private List<ContaBancariaDto> contasBancarias;
    private Set<SacadoDto> sacados;
    private String ramoDeAtividade;
    private List<String> emails;
}