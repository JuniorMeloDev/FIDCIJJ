package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MovimentacaoCaixaResponseDto {
    private Long id; 
    private LocalDate dataMovimento;
    private String descricao;
    private BigDecimal valor;
    private String contaBancaria;
    private String empresaAssociada;
    private String categoria;
    private Long operacaoId; 
}