package bordero.demo.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "condicoes_pagamento")
@Data
public class CondicaoPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CORREÇÃO APLICADA AQUI ---
    // Em vez de @Enumerated, usamos uma relação @ManyToOne
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_operacao_id", nullable = false)
    private TipoOperacao tipoOperacao;
    // --- FIM DA CORREÇÃO ---

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaJuros; // Ex: 2.00 para 2%

    @Column(nullable = false)
    private String prazos; // Ex: "14/21/28"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacado_id", nullable = false)
    @JsonBackReference
    private Sacado sacado;
}