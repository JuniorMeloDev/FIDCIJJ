package bordero.demo.service;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import bordero.demo.domain.entity.Desconto;
import bordero.demo.domain.entity.Duplicata;
import bordero.demo.domain.entity.Operacao;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
    private static final Color COLOR_DARK_GRAY = new DeviceRgb(31, 41, 55);
    private static final Color COLOR_LIGHT_GRAY = new DeviceRgb(243, 244, 246);

    private void addHeader(Document document, String title) {
        try (InputStream imageStream = getClass().getClassLoader().getResourceAsStream("images/Logo.png")) {
            if (imageStream == null) {
                 throw new RuntimeException("Arquivo de logo não encontrado! Verifique se o caminho 'src/main/resources/images/Logo.png' está correto.");
            }
            byte[] imageBytes = imageStream.readAllBytes();
            ImageData imageData = ImageDataFactory.create(imageBytes);
            Image logo = new Image(imageData).scaleToFit(120f, 60f);

            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 3}));
            headerTable.setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER);

            headerTable.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER));
            
            Paragraph titleParagraph = new Paragraph(title)
                .setBold().setFontSize(18).setTextAlignment(TextAlignment.RIGHT);
            Paragraph dateParagraph = new Paragraph("Gerado em: " + LocalDate.now().format(dateFormatter))
                .setFontSize(9).setTextAlignment(TextAlignment.RIGHT);

            headerTable.addCell(new Cell().add(titleParagraph).add(dateParagraph).setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE));

            document.add(headerTable);
            document.add(new LineSeparator(new SolidLine(1f)).setMarginTop(10));
            
        } catch (Exception e) {
            document.add(new Paragraph("FIDC IJJ").setBold().setFontSize(18));
            document.add(new Paragraph(title).setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER));
            e.printStackTrace();
        }
    }
    
    private Cell getHeaderCell(String text) {
        return new Cell()
            .add(new Paragraph(text))
            .setBold()
            .setFontColor(ColorConstants.WHITE)
            .setBackgroundColor(COLOR_DARK_GRAY)
            .setTextAlignment(TextAlignment.CENTER);
    }
    
    public byte[] generateBorderoPdf(Operacao operacao) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(new PdfDocument(new PdfWriter(baos)), PageSize.A4);
        document.setMargins(36, 36, 36, 36);

        addHeader(document, "BORDERÔ ANALÍTICO");
        
        document.add(new Paragraph("Data Assinatura: " + operacao.getDataOperacao().format(dateFormatter)).setTextAlignment(TextAlignment.RIGHT).setMarginTop(20));
        document.add(new Paragraph("Empresa: " + operacao.getEmpresaCedente())); 
        
        document.add(new Paragraph("\n"));
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 4, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));
        
        table.addHeaderCell(getHeaderCell("Nº. Do Título"));
        table.addHeaderCell(getHeaderCell("Venc. Parcelas"));
        table.addHeaderCell(getHeaderCell("Sacado/Emitente"));
        table.addHeaderCell(getHeaderCell("Juros Parcela"));
        table.addHeaderCell(getHeaderCell("Valor"));

        boolean oddRow = true;
        for (Duplicata duplicata : operacao.getDuplicatas()) {
            table.addCell(new Cell().add(new Paragraph(duplicata.getNfCte())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(duplicata.getDataVencimento().format(dateFormatter))).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(duplicata.getClienteSacado())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(duplicata.getValorJuros()))).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(duplicata.getValorBruto()))).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            oddRow = !oddRow;
        }

        table.addFooterCell(new Cell(1, 3).add(new Paragraph("TOTAIS").setBold()).setBorder(Border.NO_BORDER));
        table.addFooterCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalJuros())).setBold()).setTextAlignment(TextAlignment.RIGHT));
        table.addFooterCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalBruto())).setBold()).setTextAlignment(TextAlignment.RIGHT));
        
        document.add(table);
        
        addTotaisSection(document, operacao);

        document.close();
        return baos.toByteArray();
    }
    
    private void addTotaisSection(Document document, Operacao operacao) {
        document.add(new Paragraph("\n\n"));
        Table totaisTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        totaisTable.setWidth(UnitValue.createPercentValue(50)).setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

        totaisTable.addCell(new Cell().add(new Paragraph("Valor total dos Títulos:")).setBorder(Border.NO_BORDER));
        totaisTable.addCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalBruto()))).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

        totaisTable.addCell(new Cell().add(new Paragraph("Deságio (" + operacao.getTipoOperacao().getNome() +"):")).setBorder(Border.NO_BORDER));
        totaisTable.addCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorTotalJuros()))).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

        if (operacao.getDescontos() != null && !operacao.getDescontos().isEmpty()) {
            for (Desconto desconto : operacao.getDescontos()) {
                totaisTable.addCell(new Cell().add(new Paragraph(desconto.getDescricao() + ":")).setBorder(Border.NO_BORDER));
                totaisTable.addCell(new Cell().add(new Paragraph(formatCurrency(desconto.getValor()))).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
            }
        }

        totaisTable.addCell(new Cell().add(new Paragraph("Líquido da Operação:").setBold()).setBorder(Border.NO_BORDER));
        totaisTable.addCell(new Cell().add(new Paragraph(formatCurrency(operacao.getValorLiquido())).setBold()).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

        document.add(totaisTable);
    }

    public byte[] generateFluxoCaixaPdf(List<MovimentacaoCaixaResponseDto> movimentacoes, LocalDate dataInicio, LocalDate dataFim, String conta, String categoria) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(new PdfDocument(new PdfWriter(baos)), PageSize.A4.rotate());
        document.setMargins(36, 36, 36, 36);

        addHeader(document, "Relatório de Fluxo de Caixa");
        addFiltersSection(document, dataInicio, dataFim, null, null, conta, categoria);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 4, 3, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100)).setMarginTop(15);

        table.addHeaderCell(getHeaderCell("Data"));
        table.addHeaderCell(getHeaderCell("Descrição"));
        table.addHeaderCell(getHeaderCell("Conta"));
        table.addHeaderCell(getHeaderCell("Valor"));
        table.addHeaderCell(getHeaderCell("Categoria"));
        table.addHeaderCell(getHeaderCell("Empresa Associada"));

        boolean oddRow = true;
        for (MovimentacaoCaixaResponseDto mov : movimentacoes) {
            table.addCell(new Cell().add(new Paragraph(mov.getDataMovimento().format(dateFormatter))).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(mov.getDescricao())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(mov.getContaBancaria())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(mov.getValor()))).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(mov.getCategoria())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(mov.getEmpresaAssociada())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            oddRow = !oddRow;
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
        Document document = new Document(new PdfDocument(new PdfWriter(baos)), PageSize.A4.rotate());
        document.setMargins(36, 36, 36, 36);

        addHeader(document, "Relatório de Duplicatas");
        addFiltersSection(document, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado, status);

        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 3, 3, 2, 1.5f, 2, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100)).setMarginTop(15);

        table.addHeaderCell(getHeaderCell("Data Op."));
        table.addHeaderCell(getHeaderCell("NF/CT-e"));
        table.addHeaderCell(getHeaderCell("Cedente"));
        table.addHeaderCell(getHeaderCell("Sacado"));
        table.addHeaderCell(getHeaderCell("Valor Bruto"));
        table.addHeaderCell(getHeaderCell("Juros"));
        table.addHeaderCell(getHeaderCell("Vencimento"));
        table.addHeaderCell(getHeaderCell("Status"));
        table.addHeaderCell(getHeaderCell("Data Liq."));
        table.addHeaderCell(getHeaderCell("Conta Liq."));
        
        boolean oddRow = true;
        for (DuplicataResponseDto dup : duplicatas) {
            table.addCell(new Cell().add(new Paragraph(dup.getDataOperacao().format(dateFormatter))).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getNfCte())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getEmpresaCedente())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getClienteSacado())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(dup.getValorBruto()))).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(formatCurrency(dup.getValorJuros()))).setTextAlignment(TextAlignment.RIGHT).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getDataVencimento().format(dateFormatter))).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getStatusRecebimento())).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getDataLiquidacao() != null ? dup.getDataLiquidacao().format(dateFormatter) : "-")).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            table.addCell(new Cell().add(new Paragraph(dup.getContaLiquidacao() != null ? dup.getContaLiquidacao() : "-")).setBackgroundColor(oddRow ? COLOR_LIGHT_GRAY : ColorConstants.WHITE));
            oddRow = !oddRow;
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
        Document document = new Document(new PdfDocument(new PdfWriter(baos)), PageSize.A4);
        document.setMargins(36, 36, 36, 36);

        addHeader(document, "Relatório de Total Operado");
        addFiltersSection(document, dataInicio, dataFim, tipoOperacaoNome, clienteNome, sacado, null);
    
        document.add(new Paragraph("Total Operado no Período: " + formatCurrency(metrics.getValorOperadoNoMes())).setBold().setFontSize(14).setMarginTop(20));
    
        document.add(new Paragraph("Cedentes").setBold().setFontSize(12).setMarginTop(20));
        Table cedentesTable = new Table(UnitValue.createPercentArray(new float[]{4, 2}));
        cedentesTable.setWidth(UnitValue.createPercentValue(100));
        cedentesTable.addHeaderCell(getHeaderCell("Nome"));
        cedentesTable.addHeaderCell(getHeaderCell("Valor Total"));
        for (DashboardMetricsDto.RankingDto ranking : metrics.getTopClientes()) {
            cedentesTable.addCell(ranking.getNome());
            cedentesTable.addCell(new Cell().add(new Paragraph(formatCurrency(ranking.getValorTotal()))).setTextAlignment(TextAlignment.RIGHT));
        }
        document.add(cedentesTable);
    
        document.add(new Paragraph("Sacados").setBold().setFontSize(12).setMarginTop(20));
        Table sacadosTable = new Table(UnitValue.createPercentArray(new float[]{4, 2}));
        sacadosTable.setWidth(UnitValue.createPercentValue(100));
        sacadosTable.addHeaderCell(getHeaderCell("Nome"));
        sacadosTable.addHeaderCell(getHeaderCell("Valor Total"));
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