package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "tipos_operacao")
@Data
public class TipoOperacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    // Taxa de juros percentual (ex: 2.5 para 2,5%)
    @Column(precision = 10, scale = 4)
    private BigDecimal taxaJuros;

    // Valor fixo a ser descontado, se aplicável
    @Column(precision = 19, scale = 2)
    private BigDecimal valorFixo;

    // Valor de despesas bancárias a ser descontado, se aplicável
    @Column(precision = 19, scale = 2)
    private BigDecimal despesasBancarias;

    @Column(name = "descricao", length = 500) // length define o tamanho máximo
    private String descricao;
}