package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

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

    // Relação com Sacados
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
