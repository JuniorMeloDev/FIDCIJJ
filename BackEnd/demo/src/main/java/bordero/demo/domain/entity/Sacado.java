package bordero.demo.domain.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "sacados")
@Data
public class Sacado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(unique = true)
    private String cnpj;
    
    private String endereco;
    private String bairro;
    private String municipio;
    private String uf;
    private String fone;
    private String ie;
    private String cep;

    @ManyToMany(mappedBy = "sacados")
    private Set<Cliente> clientes;

    @OneToMany(mappedBy = "sacado", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CondicaoPagamento> condicoesPagamento;
}