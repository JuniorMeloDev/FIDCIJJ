package bordero.demo.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "duplicatas")
@Data
public class Duplicata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mapeamento explícito para o nome da coluna no banco de dados
    @Column(name = "data_operacao", nullable = false)
    private LocalDate dataOperacao;

    @Column(name = "nf_cte", nullable = false)
    private String nfCte;

    @Column(name = "empresa_cedente", nullable = false)
    private String empresaCedente;

    @Column(name = "valor_bruto", nullable = false, precision = 19, scale = 2)
    private BigDecimal valorBruto;

    @Column(name = "valor_juros", nullable = false, precision = 19, scale = 2)
    private BigDecimal valorJuros;

    @Column(name = "cliente_sacado", nullable = false)
    private String clienteSacado;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_operacao", nullable = false)
    private TipoOperacao tipoOperacao;

    @Column(name = "status_recebimento", nullable = false)
    private String statusRecebimento = "Pendente";
}
