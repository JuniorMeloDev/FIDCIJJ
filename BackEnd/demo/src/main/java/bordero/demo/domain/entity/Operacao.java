package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "operacoes")
@Data
public class Operacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dataOperacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoOperacao tipoOperacao;

    @Column(nullable = false)
    private String empresaCedente;

    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL)
    private List<Duplicata> duplicatas;
    
    // RELACIONAMENTO ADICIONADO
    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL)
    private List<Desconto> descontos;

    @OneToOne(mappedBy = "operacao", cascade = CascadeType.ALL)
    private MovimentacaoCaixa movimentacaoCaixa;
    
    private BigDecimal valorTotalBruto;
    private BigDecimal valorTotalJuros;
    private BigDecimal valorTotalDescontos;
    private BigDecimal valorLiquido;
}
