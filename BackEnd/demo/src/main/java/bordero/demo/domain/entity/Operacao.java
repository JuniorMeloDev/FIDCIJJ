package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList; 
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_operacao_id", nullable = false)
    private TipoOperacao tipoOperacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Duplicata> duplicatas = new ArrayList<>();

    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Desconto> descontos = new ArrayList<>();

    @OneToOne(mappedBy = "operacao", cascade = CascadeType.ALL)
    private MovimentacaoCaixa movimentacaoCaixa;
    
    private BigDecimal valorTotalBruto;
    private BigDecimal valorTotalJuros;
    private BigDecimal valorTotalDescontos;
    private BigDecimal valorLiquido;

    public String getEmpresaCedente() {
        return cliente != null ? cliente.getNome() : null;
    }
}