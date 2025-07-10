package bordero.demo.domain.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(unique = true)
    private String cnpj;

    @Column(name = "ramo_atividade")
    private String ramoDeAtividade;

    
    // --- NOVOS CAMPOS (iguais ao Sacado) ---
    private String endereco;
    private String bairro;
    private String municipio;
    private String uf;
    private String fone;
    private String ie;
    private String cep;

    // --- NOVA RELAÇÃO COM CONTAS BANCÁRIAS ---
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ContaBancaria> contasBancarias;

    // Relação com Sacados (sem alterações)
    @ManyToMany
    @JoinTable(
        name = "cliente_sacado",
        joinColumns = @JoinColumn(name = "cliente_id"),
        inverseJoinColumns = @JoinColumn(name = "sacado_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Sacado> sacados;
}