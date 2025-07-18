package bordero.demo.domain.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "condicoes_pagamento")
@Data
public class CondicaoPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer parcelas;

    @Column(nullable = false)
    private String prazos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sacado_id", nullable = false)
    @JsonBackReference
    private Sacado sacado;
}