package bordero.demo.service;

import bordero.demo.domain.entity.Desconto;
import bordero.demo.domain.entity.Duplicata;
import bordero.demo.domain.entity.Operacao;
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

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

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

    private String formatCurrency(BigDecimal value) {
        if (value == null) return "R$ 0,00";
        return String.format(localeBR, "R$ %,.2f", value);
    }
}
