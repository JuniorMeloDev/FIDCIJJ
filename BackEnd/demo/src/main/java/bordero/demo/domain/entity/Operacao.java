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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_operacao_id", nullable = false)
    private TipoOperacao tipoOperacao;

    // --- CAMPO ALTERADO ---
    // Agora é uma relação Muitos-para-Um com a entidade Cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    // --- FIM DA ALTERAÇÃO ---

    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL)
    private List<Duplicata> duplicatas;
    
    @OneToMany(mappedBy = "operacao", cascade = CascadeType.ALL)
    private List<Desconto> descontos;

    @OneToOne(mappedBy = "operacao", cascade = CascadeType.ALL)
    private MovimentacaoCaixa movimentacaoCaixa;
    
    private BigDecimal valorTotalBruto;
    private BigDecimal valorTotalJuros;
    private BigDecimal valorTotalDescontos;
    private BigDecimal valorLiquido;

    // Adicionado um getter manual para manter a compatibilidade com o DTO
    public String getEmpresaCedente() {
        return cliente != null ? cliente.getNome() : null;
    }
}