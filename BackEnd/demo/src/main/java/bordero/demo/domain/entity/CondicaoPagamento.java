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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoOperacao tipoOperacao;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaJuros; // Ex: 2.00 para 2%

    @Column(nullable = false)
    private String prazos; // Ex: "14/21/28"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacado_id", nullable = false)
    @JsonBackReference
    private Sacado sacado;
}