package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacoes_caixa")
@Data
public class MovimentacaoCaixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_movimento", nullable = false)
    private LocalDate dataMovimento;

    @Column(name = "conta_bancaria", nullable = false)
    private String contaBancaria;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String categoria;
    
    @Column(name = "empresa_associada")
    private String empresaAssociada;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operacao_id")
    private Operacao operacao;
}
