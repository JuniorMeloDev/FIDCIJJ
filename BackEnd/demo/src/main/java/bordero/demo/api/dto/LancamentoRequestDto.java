package bordero.demo.api.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LancamentoRequestDto {
    
    private String tipo; // "DEBITO", "CREDITO", ou "TRANSFERENCIA"
    private LocalDate data;
    private String descricao;
    private BigDecimal valor;
    private String contaOrigem;
    private String contaDestino; // Usado apenas para transferências
    private String empresaAssociada;
    private String empresaDestino;

}