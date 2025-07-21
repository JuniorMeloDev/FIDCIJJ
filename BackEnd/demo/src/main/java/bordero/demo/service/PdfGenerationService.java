package bordero.demo.service;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.Desconto;
import bordero.demo.domain.entity.Duplicata;
import bordero.demo.domain.entity.Operacao;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PdfGenerationService {

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final Locale localeBR = new Locale("pt", "BR");

    public byte[] generateBorderoPdf(Operacao operacao) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(36, 36, 36, 36);

        // Título
        Paragraph titulo = new Paragraph("BORDERÔ ANALÍTICO")
                .setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER).setUnderline();
        document.add(titulo);
        
        // Data da Assinatura
        Paragraph dataAssinatura = new Paragraph("Data Assinatura: " + operacao.getDataOperacao().format(dateFormatter))
                .setTextAlignment(TextAlignment.RIGHT).setMarginTop(20);
        document.add(dataAssinatura);
        
        // Cabeçalho da Operação
        document.add(new Paragraph("Empresa: FIDC IJJ ")); 
        
        // Tabela de Duplicatas
        document.add(new Paragraph("\n"));
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 4, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));
        
        addTableHeader(table);
        addTableRows(table, operacao);
        addTableFooter(table, operacao);
        
        document.add(table);
        
        // Seção de totais
        addTotaisSection(document, operacao);

        document.close();
        return baos.toByteArray();
    }

    private void addTableHeader(Table table) {
        table.addHeaderCell(new Cell().add(new Paragraph("Nº. Do Título").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Venc. Parcelas").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Sacado/Emitente").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Juros Parcela").setBold().setTextAlignment(TextAlignment.RIGHT)));
        table.addHeaderCell(new Cell().add(new Paragraph("Valor").setBold().setTextAlignment(TextAlignment.RIGHT)));
    }

    private void addTableRows(Table table, Operacao operacao) {
        for (Duplicata duplicata : operacao.getDuplicatas()) {
            table.addCell(duplicata.getNfCte());
            table.addCell(duplicata.getDataVencimento().format(dateFormatter));
            table.addCell(duplicata.getClienteSacado());
            table.addCell(new Cell().add(new Paragraph(formatCurrency(duplicata.getValorJuros()))).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(duplicata.getValorBruto()))).setTextAlignment(TextAlignment.RIGHT));
        }
    }

    private void addTableFooter(Table table, Operacao operacao) {
        table.addFooterCell(new Cell(1, 3).add(new Paragraph("")));
        table.addFooterCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalJuros())).setBold()).setTextAlignment(TextAlignment.RIGHT));
        table.addFooterCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalBruto())).setBold()).setTextAlignment(TextAlignment.RIGHT));
    }
    
    private void addTotaisSection(Document document, Operacao operacao) {
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("Valor total dos Títulos: \t" + formatCurrency(operacao.getValorTotalBruto())));
        document.add(new Paragraph("Deságio (" + operacao.getTipoOperacao().getNome() +"): \t" + formatCurrency(operacao.getValorTotalJuros())));
        
        if (operacao.getDescontos() != null && !operacao.getDescontos().isEmpty()) {
            document.add(new Paragraph("Outros Descontos:").setBold());
            for (Desconto desconto : operacao.getDescontos()) {
                document.add(new Paragraph(desconto.getDescricao() + ": \t" + formatCurrency(desconto.getValor())));
            }
        }

        document.add(new Paragraph("Líquido da Operação: \t" + formatCurrency(operacao.getValorLiquido())).setBold());
    }

    public byte[] generateFluxoCaixaPdf(List<MovimentacaoCaixaResponseDto> movimentacoes, LocalDate dataInicio, LocalDate dataFim, String conta, String categoria) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdf, PageSize.A4.rotate());

        document.add(new Paragraph("Relatório de Fluxo de Caixa").setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER));
        
        addFiltersSection(document, dataInicio, dataFim, null, null, conta, categoria);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 4, 3, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100)).setMarginTop(20);

        table.addHeaderCell("Data");
        table.addHeaderCell("Descrição");
        table.addHeaderCell("Conta");
        table.addHeaderCell("Valor");
        table.addHeaderCell("Categoria");
        table.addHeaderCell("Empresa Associada");

        for (MovimentacaoCaixaResponseDto mov : movimentacoes) {
            table.addCell(mov.getDataMovimento().format(dateFormatter));
            table.addCell(mov.getDescricao());
            table.addCell(mov.getContaBancaria());
            table.addCell(new Cell().add(new Paragraph(formatCurrency(mov.getValor()))).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(mov.getCategoria());
            table.addCell(mov.getEmpresaAssociada());
        }

        document.add(table);

        BigDecimal total = movimentacoes.stream().map(MovimentacaoCaixaResponseDto::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
        document.add(new Paragraph("Total Geral: " + formatCurrency(total)).setBold().setTextAlignment(TextAlignment.RIGHT).setMarginTop(10));
        
        if (!StringUtils.hasText(conta)) {
            Map<String, BigDecimal> totaisPorConta = movimentacoes.stream()
                .collect(Collectors.groupingBy(MovimentacaoCaixaResponseDto::getContaBancaria, 
                                                Collectors.reducing(BigDecimal.ZERO, MovimentacaoCaixaResponseDto::getValor, BigDecimal::add)));
        
            document.add(new Paragraph("Totais por Conta:").setBold().setMarginTop(10));
            for (Map.Entry<String, BigDecimal> entry : totaisPorConta.entrySet()) {
                document.add(new Paragraph(entry.getKey() + ": " + formatCurrency(entry.getValue())).setMarginLeft(20));
            }
        }

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateDuplicatasPdf(List<DuplicataResponseDto> duplicatas, LocalDate dataInicio, LocalDate dataFim, String clienteNome, String tipoOperacaoNome, String sacado, String status) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdf, PageSize.A4.rotate());

        document.add(new Paragraph("Relatório de Duplicatas").setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER));

        addFiltersSection(document, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado, status);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 3, 2, 2, 2, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100)).setMarginTop(20);

        table.addHeaderCell("Data Op.");
        table.addHeaderCell("NF/CT-e");
        table.addHeaderCell("Sacado");
        table.addHeaderCell("Valor Bruto");
        table.addHeaderCell("Juros");
        table.addHeaderCell("Vencimento");
        table.addHeaderCell("Status");
        table.addHeaderCell("Data Liq.");
        table.addHeaderCell("Conta Liq.");

        for (DuplicataResponseDto dup : duplicatas) {
            table.addCell(dup.getDataOperacao().format(dateFormatter));
            table.addCell(dup.getNfCte());
            table.addCell(dup.getClienteSacado());
            table.addCell(new Cell().add(new Paragraph(formatCurrency(dup.getValorBruto()))).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(dup.getValorJuros()))).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(dup.getDataVencimento().format(dateFormatter));
            table.addCell(dup.getStatusRecebimento());
            table.addCell(dup.getDataLiquidacao() != null ? dup.getDataLiquidacao().format(dateFormatter) : "-");
            table.addCell(dup.getContaLiquidacao() != null ? dup.getContaLiquidacao() : "-");
        }

        document.add(table);

        long totalNfs = duplicatas.stream().map(d -> d.getNfCte().split("\\.")[0]).distinct().count();
        BigDecimal totalBruto = duplicatas.stream().map(DuplicataResponseDto::getValorBruto).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalJuros = duplicatas.stream().map(DuplicataResponseDto::getValorJuros).reduce(BigDecimal.ZERO, BigDecimal::add);

        document.add(new Paragraph("Quantidade de NF/Ct-e's operadas: " + totalNfs).setBold().setMarginTop(10));
        document.add(new Paragraph("Valor Total Bruto: " + formatCurrency(totalBruto)).setBold());
        document.add(new Paragraph("Total de Juros: " + formatCurrency(totalJuros)).setBold());


        document.close();
        return baos.toByteArray();
    }
    
    public byte[] generateTotalOperadoPdf(DashboardMetricsDto metrics, LocalDate dataInicio, LocalDate dataFim, String tipoOperacaoNome, String clienteNome, String sacado) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdf, PageSize.A4);
    
        document.add(new Paragraph("Relatório de Total Operado").setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER));
    
        addFiltersSection(document, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado, null);
    
        document.add(new Paragraph("Total Operado no Período: " + formatCurrency(metrics.getValorOperadoNoMes())).setBold().setMarginTop(20));
    
        document.add(new Paragraph("Top 5 Cedentes").setBold().setMarginTop(20));
        Table cedentesTable = new Table(UnitValue.createPercentArray(new float[]{4, 2}));
        cedentesTable.setWidth(UnitValue.createPercentValue(100));
        cedentesTable.addHeaderCell("Nome");
        cedentesTable.addHeaderCell("Valor Total");
        for (DashboardMetricsDto.RankingDto ranking : metrics.getTopClientes()) {
            cedentesTable.addCell(ranking.getNome());
            cedentesTable.addCell(new Cell().add(new Paragraph(formatCurrency(ranking.getValorTotal()))).setTextAlignment(TextAlignment.RIGHT));
        }
        document.add(cedentesTable);
    
        document.add(new Paragraph("Top 5 Sacados").setBold().setMarginTop(20));
        Table sacadosTable = new Table(UnitValue.createPercentArray(new float[]{4, 2}));
        sacadosTable.setWidth(UnitValue.createPercentValue(100));
        sacadosTable.addHeaderCell("Nome");
        sacadosTable.addHeaderCell("Valor Total");
        for (DashboardMetricsDto.RankingDto ranking : metrics.getTopSacados()) {
            sacadosTable.addCell(ranking.getNome());
            sacadosTable.addCell(new Cell().add(new Paragraph(formatCurrency(ranking.getValorTotal()))).setTextAlignment(TextAlignment.RIGHT));
        }
        document.add(sacadosTable);
    
        document.close();
        return baos.toByteArray();
    }
    
    private void addFiltersSection(Document document, LocalDate dataInicio, LocalDate dataFim, String tipoOperacaoNome, String clienteNome, String sacado, String status) {
        Paragraph filtersHeader = new Paragraph("Filtros Aplicados:")
            .setBold()
            .setFontColor(ColorConstants.GRAY)
            .setFontSize(10)
            .setMarginTop(15);
        document.add(filtersHeader);

        if (dataInicio != null || dataFim != null) {
            String de = dataInicio != null ? dataInicio.format(dateFormatter) : "__/__/____";
            String ate = dataFim != null ? dataFim.format(dateFormatter) : "__/__/____";
            document.add(new Paragraph("Período de: " + de + " até " + ate).setFontSize(9));
        }
        if (StringUtils.hasText(tipoOperacaoNome)) {
            document.add(new Paragraph("Tipo de Operação: " + tipoOperacaoNome).setFontSize(9));
        }
        if (StringUtils.hasText(clienteNome)) {
            document.add(new Paragraph("Cedente: " + clienteNome).setFontSize(9));
        }
        if (StringUtils.hasText(sacado)) {
            document.add(new Paragraph("Sacado: " + sacado).setFontSize(9));
        }
         if (StringUtils.hasText(status) && !"Todos".equalsIgnoreCase(status)) {
            document.add(new Paragraph("Status: " + status).setFontSize(9));
        }
    }

    private String formatCurrency(BigDecimal value) {
        if (value == null) return "R$ 0,00";
        return String.format(localeBR, "R$ %,.2f", value);
    }
}