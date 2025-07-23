package bordero.demo.service;

import bordero.demo.api.dto.DashboardMetricsDto;
import bordero.demo.api.dto.DuplicataResponseDto;
import bordero.demo.api.dto.MovimentacaoCaixaResponseDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ExcelGenerationService {

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // NOVO MÉTODO PARA GERAR O RELATÓRIO DE TOTAL OPERADO
    public byte[] generateTotalOperadoExcel(DashboardMetricsDto metrics) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Total Operado");

        // Estilos
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);

        // Título Principal
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Relatório de Total Operado");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

        // Total Operado no Período
        Row totalRow = sheet.createRow(2);
        totalRow.createCell(0).setCellValue("Total Operado no Período:");
        createCell(totalRow, 1, metrics.getValorOperadoNoMes(), currencyStyle);

        // Top 5 Cedentes
        int currentRow = 4;
        Row cedentesHeaderRow = sheet.createRow(currentRow++);
        cedentesHeaderRow.createCell(0).setCellValue("Cedentes");
        cedentesHeaderRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(currentRow - 1, currentRow - 1, 0, 1));
        
        for (DashboardMetricsDto.RankingDto ranking : metrics.getTopClientes()) {
            Row row = sheet.createRow(currentRow++);
            row.createCell(0).setCellValue(ranking.getNome());
            createCell(row, 1, ranking.getValorTotal(), currencyStyle);
        }

        // Top 5 Sacados
        currentRow++; // Add a blank row for spacing
        Row sacadosHeaderRow = sheet.createRow(currentRow++);
        sacadosHeaderRow.createCell(0).setCellValue("Sacados");
        sacadosHeaderRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(currentRow - 1, currentRow - 1, 0, 1));
        
        for (DashboardMetricsDto.RankingDto ranking : metrics.getTopSacados()) {
            Row row = sheet.createRow(currentRow++);
            row.createCell(0).setCellValue(ranking.getNome());
            createCell(row, 1, ranking.getValorTotal(), currencyStyle);
        }
        
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }


    public byte[] generateFluxoCaixaExcel(List<MovimentacaoCaixaResponseDto> movimentacoes) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Fluxo de Caixa");
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        String[] headers = {"Data", "Descrição", "Conta", "Valor", "Categoria", "Empresa Associada"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        AtomicInteger rowNum = new AtomicInteger(1);
        movimentacoes.forEach(mov -> {
            Row row = sheet.createRow(rowNum.getAndIncrement());
            createCell(row, 0, mov.getDataMovimento(), dateStyle);
            row.createCell(1).setCellValue(mov.getDescricao());
            row.createCell(2).setCellValue(mov.getContaBancaria());
            createCell(row, 3, mov.getValor(), currencyStyle);
            row.createCell(4).setCellValue(mov.getCategoria());
            row.createCell(5).setCellValue(mov.getEmpresaAssociada());
        });
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
    
    public byte[] generateDuplicatasExcel(List<DuplicataResponseDto> duplicatas) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Duplicatas");
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle dateStyle = createDateStyle(workbook);
        String[] headers = {"Data Op.", "NF/CT-e", "Cedente", "Sacado", "Valor Bruto", "Juros", "Vencimento", "Status", "Data Liq.", "Conta Liq."};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        AtomicInteger rowNum = new AtomicInteger(1);
        duplicatas.forEach(dup -> {
            Row row = sheet.createRow(rowNum.getAndIncrement());
            createCell(row, 0, dup.getDataOperacao(), dateStyle);
            row.createCell(1).setCellValue(dup.getNfCte());
            row.createCell(2).setCellValue(dup.getEmpresaCedente());
            row.createCell(3).setCellValue(dup.getClienteSacado());
            createCell(row, 4, dup.getValorBruto(), currencyStyle);
            createCell(row, 5, dup.getValorJuros(), currencyStyle);
            createCell(row, 6, dup.getDataVencimento(), dateStyle);
            row.createCell(7).setCellValue(dup.getStatusRecebimento());
            createCell(row, 8, dup.getDataLiquidacao(), dateStyle);
            row.createCell(9).setCellValue(dup.getContaLiquidacao());
        });
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        return style;
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("R$ #,##0.00"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy"));
        return style;
    }

    private void createCell(Row row, int column, Object value, CellStyle style) {
        if (value == null) return;
        Cell cell = row.createCell(column);
        if (value instanceof BigDecimal) {
            cell.setCellValue(((BigDecimal) value).doubleValue());
        } else if (value instanceof LocalDate) {
            cell.setCellValue((LocalDate) value);
        }
        if (style != null) {
            cell.setCellStyle(style);
        }
    }
}