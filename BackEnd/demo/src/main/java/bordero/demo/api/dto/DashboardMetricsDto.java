package bordero.demo.api.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardMetricsDto {
    private BigDecimal valorOperadoNoMes;
    private List<RankingDto> topClientes;
    private List<RankingDto> topSacados;
    private List<DuplicataResponseDto> vencimentosProximos;

    @Data
    @Builder
    public static class RankingDto {
        private String nome;
        private BigDecimal valorTotal;
    }
}