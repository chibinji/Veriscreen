package com.veriscreen.backend.service.document;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.OfficialDocumentType;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OfficialPdfService {

    private static final Color NAVY = new Color(10, 37, 84);
    private static final Color GOLD = new Color(184, 148, 49);
    private static final Color TABLE_HEADER = new Color(232, 238, 246);
    private static final Color BORDER = new Color(180, 188, 200);
    private static final Color MUTED = new Color(82, 90, 102);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final String CURRENCY = "ZMW";
    private static final List<FeeDescriptionRow> PAYMENT_DETAIL_ROWS = List.of(
            new FeeDescriptionRow("Balances", "balance", "balances"),
            new FeeDescriptionRow("Examination", "examination", "exam"),
            new FeeDescriptionRow("Medical", "medical"),
            new FeeDescriptionRow("Recreation", "recreation"),
            new FeeDescriptionRow("Student union", "student union", "union"),
            new FeeDescriptionRow("Accommodation", "accommodation"),
            new FeeDescriptionRow("Internet", "internet"),
            new FeeDescriptionRow("Registration", "registration"),
            new FeeDescriptionRow("Maintenance", "maintenance"),
            new FeeDescriptionRow("Library fee", "library"),
            new FeeDescriptionRow("Student ID", "student id", "studentid", "id card"),
            new FeeDescriptionRow("Tuition", "tuition"));

    private final QrCodeService qrCodeService;
    private final String universityName;
    private final String logoClasspath;

    public OfficialPdfService(
            QrCodeService qrCodeService,
            @Value("${veriscreen.university.name:University of Zambia}") String universityName,
            @Value("${veriscreen.documents.logo-classpath:static/images/university-logo.png}") String logoClasspath) {
        this.qrCodeService = qrCodeService;
        this.universityName = universityName;
        this.logoClasspath = logoClasspath;
    }

    public byte[] renderConfirmationSlip(
            Student student,
            List<Registration> registrations,
            List<AcademicResult> results,
            String academicYear,
            String yearOfStudy,
            String documentId,
            String verificationUrl) {
        return render(student, academicYear, yearOfStudy, documentId, verificationUrl, OfficialDocumentType.CONFIRMATION_SLIP, document -> {
            addCourseTable(document, "Courses registered", results, "No registered courses on file");
        });
    }

    public byte[] renderAcademicResults(
            Student student,
            List<AcademicResult> results,
            String academicYear,
            String yearOfStudy,
            String documentId,
            String verificationUrl) {
        return render(student, academicYear, yearOfStudy, documentId, verificationUrl, OfficialDocumentType.RESULTS, document -> {
            addSectionTitle(document, "Course results");
            PdfPTable table = table(new float[] {40, 30, 30});
            addHeaderRow(table, "Course code", "Grade", "Credits");
            int totalCredits = 0;
            if (results.isEmpty()) {
                addEmptyRow(table, 3, "No academic results on file");
            } else {
                for (AcademicResult result : results) {
                    int credits = result.getCredits() != null ? result.getCredits() : 0;
                    totalCredits += credits;
                    addBodyRow(
                            table,
                            text(result.getCourseCode()),
                            text(result.getGrade()),
                            result.getCredits() != null ? String.valueOf(result.getCredits()) : "—");
                }
                PdfPCell totalLabel = bodyCell("Total credits", true);
                totalLabel.setColspan(2);
                table.addCell(totalLabel);
                table.addCell(bodyCell(String.valueOf(totalCredits), true));
            }
            document.add(table);
        });
    }

    public byte[] renderExaminationSlip(
            Student student,
            List<Examination> examinations,
            List<AcademicResult> results,
            String academicYear,
            String yearOfStudy,
            String documentId,
            String verificationUrl) {
        return render(student, academicYear, yearOfStudy, documentId, verificationUrl, OfficialDocumentType.EXAMINATION_SLIP, document -> {
            addCourseTable(document, "Courses registered", results, "No registered courses on file");
            addInvigilatorNotes(document, examinations, academicYear);
        });
    }

    public byte[] renderPaymentHistory(
            Student student,
            List<Fee> fees,
            String academicYear,
            String yearOfStudy,
            String documentId,
            String verificationUrl) {
        return render(student, academicYear, yearOfStudy, documentId, verificationUrl, OfficialDocumentType.PAYMENT_HISTORY, document -> {
            addSectionTitle(document, "Payment details");
            PdfPTable table = table(new float[] {40, 16, 22, 22});
            addHeaderRow(table, "Fee Description", "Currency", "Amount", "Paid");

            List<Fee> unmapped = new ArrayList<>(fees);
            for (FeeDescriptionRow row : PAYMENT_DETAIL_ROWS) {
                List<Fee> matched = unmapped.stream().filter(fee -> matchesFeeDescription(fee, row)).toList();
                unmapped.removeAll(matched);
                addBodyRow(
                        table,
                        row.label(),
                        CURRENCY,
                        formatAmount(sumAmountToPay(matched)),
                        formatAmount(sumAmountPaid(matched)));
            }

            addBodyRow(
                    table,
                    true,
                    "Totals",
                    CURRENCY,
                    formatAmount(sumAmountToPay(fees)),
                    formatAmount(sumAmountPaid(fees)));
            document.add(table);
        });
    }

    private byte[] render(
            Student student,
            String academicYear,
            String yearOfStudy,
            String documentId,
            String verificationUrl,
            OfficialDocumentType type,
            PdfBodyWriter bodyWriter) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 42, 42, 48, 72);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new OfficialFooter(documentId));
            document.open();
            addBanner(document, type, documentId, verificationUrl);
            addStudentSection(document, student, academicYear, yearOfStudy);
            bodyWriter.write(document);
            addVerificationNote(document);
            document.close();
            return output.toByteArray();
        } catch (DocumentException | IOException ex) {
            throw new IllegalStateException("Unable to generate official PDF", ex);
        }
    }

    private void addBanner(Document document, OfficialDocumentType type, String documentId, String verificationUrl)
            throws DocumentException, IOException {
        PdfPTable banner = new PdfPTable(new float[] {16, 64, 20});
        banner.setWidthPercentage(100);
        banner.setSpacingAfter(10);

        PdfPCell logoCell = imageCell(loadLogo(), 72, 72, Element.ALIGN_LEFT);
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        banner.addCell(logoCell);

        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        titleCell.setPaddingLeft(8);
        titleCell.addElement(new Paragraph(universityName.toUpperCase(), new Font(Font.HELVETICA, 13, Font.BOLD, NAVY)));
        Paragraph title = new Paragraph(type.getTitle(), new Font(Font.HELVETICA, 16, Font.BOLD, NAVY));
        title.setSpacingBefore(3);
        titleCell.addElement(title);
        Paragraph issued = new Paragraph(
                "Official student document  ·  " + documentId, new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED));
        issued.setSpacingBefore(3);
        titleCell.addElement(issued);
        banner.addCell(titleCell);

        PdfPCell qrCell = new PdfPCell();
        qrCell.setBorder(Rectangle.NO_BORDER);
        qrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Image qr = loadQr(verificationUrl);
        if (qr != null) {
            qr.scaleToFit(78, 78);
            qr.setAlignment(Image.ALIGN_RIGHT);
            qrCell.addElement(qr);
        }
        Paragraph verifyUrl = new Paragraph(verificationUrl, new Font(Font.HELVETICA, 6, Font.NORMAL, MUTED));
        verifyUrl.setAlignment(Element.ALIGN_RIGHT);
        qrCell.addElement(verifyUrl);
        banner.addCell(qrCell);
        document.add(banner);

        PdfPTable accent = new PdfPTable(1);
        accent.setWidthPercentage(100);
        accent.setSpacingAfter(12);
        PdfPCell line = new PdfPCell(new Phrase(" "));
        line.setFixedHeight(3);
        line.setBackgroundColor(GOLD);
        line.setBorder(Rectangle.NO_BORDER);
        accent.addCell(line);
        document.add(accent);
    }

    private void addCourseTable(
            Document document, String title, List<AcademicResult> results, String emptyMessage)
            throws DocumentException {
        addSectionTitle(document, title);
        PdfPTable table = table(new float[] {12, 58, 30});
        addHeaderRow(table, "No.", "Course code", "Credits");
        if (results.isEmpty()) {
            addEmptyRow(table, 3, emptyMessage);
        } else {
            int index = 1;
            for (AcademicResult result : results) {
                addBodyRow(
                        table,
                        String.valueOf(index++),
                        text(result.getCourseCode()),
                        result.getCredits() != null ? String.valueOf(result.getCredits()) : "—");
            }
        }
        document.add(table);
    }

    private void addInvigilatorNotes(Document document, List<Examination> examinations, String academicYear)
            throws DocumentException {
        addSectionTitle(document, "Notes to the invigilator");
        PdfPTable table = table(new float[] {8, 92});
        table.setHeaderRows(0);
        addBodyRow(table, "1.", "Verify the student number and full name on this slip against a valid student identity card before admitting the candidate.");
        addBodyRow(table, "2.", "The candidate may sit only the courses listed under Courses registered.");
        addBodyRow(
                table,
                "3.",
                eligibleForSession(examinations, academicYear)
                        ? "This student is recorded as eligible for the stated academic year."
                        : "This student is not recorded as eligible for the stated academic year. Do not admit the candidate without clearance from the Examinations Office.");
        addBodyRow(table, "4.", "No unauthorized materials or communication devices are permitted. Report any discrepancy to the Examinations Office before the paper begins.");
        document.add(table);
    }

    private boolean eligibleForSession(List<Examination> examinations, String academicYear) {
        return examinations.stream()
                .filter(examination -> matchesAcademicYear(examination.getAcademicYear(), academicYear))
                .anyMatch(examination -> Boolean.TRUE.equals(examination.getEligible()));
    }

    private boolean matchesAcademicYear(String examinationYear, String academicYear) {
        if (academicYear == null || academicYear.isBlank()) {
            return true;
        }
        return academicYear.equals(examinationYear);
    }

    private void addStudentSection(
            Document document, Student student, String academicYear, String yearOfStudy) throws DocumentException {
        addSectionTitle(document, "Student information");
        PdfPTable table = table(new float[] {32, 68});
        addHeaderRow(table, "Field", "Details");
        addLabelValue(table, "Full name", text(student.getName()));
        addLabelValue(table, "Student number", text(student.getId()));
        addLabelValue(table, "NRC", text(student.getNrc()));
        addLabelValue(table, "Programme", text(student.getProgram()));
        addLabelValue(table, "Academic year", text(academicYear));
        addLabelValue(table, "Year of study", text(yearOfStudy));
        document.add(table);
    }

    private void addVerificationNote(Document document) throws DocumentException {
        Paragraph note = new Paragraph(
                "Scan the QR code to verify this document. The verification service confirms authenticity only "
                        + "and does not display private student, academic, or payment details.",
                new Font(Font.HELVETICA, 8, Font.ITALIC, MUTED));
        note.setSpacingBefore(14);
        document.add(note);
    }

    private void addSectionTitle(Document document, String title) throws DocumentException {
        Paragraph heading = new Paragraph(title, new Font(Font.HELVETICA, 10, Font.BOLD, NAVY));
        heading.setSpacingBefore(6);
        heading.setSpacingAfter(6);
        document.add(heading);
    }

    private PdfPTable table(float[] widths) throws DocumentException {
        PdfPTable table = new PdfPTable(widths);
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitRows(true);
        table.setSpacingAfter(6);
        return table;
    }

    private void addHeaderRow(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, new Font(Font.HELVETICA, 8, Font.BOLD, NAVY)));
            styleCell(cell);
            cell.setBackgroundColor(TABLE_HEADER);
            table.addCell(cell);
        }
    }

    private void addBodyRow(PdfPTable table, String... values) {
        addBodyRow(table, false, values);
    }

    private void addBodyRow(PdfPTable table, boolean bold, String... values) {
        for (String value : values) {
            table.addCell(bodyCell(value, bold));
        }
    }

    private void addEmptyRow(PdfPTable table, int columns, String message) {
        PdfPCell cell = bodyCell(message, false);
        cell.setColspan(columns);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addLabelValue(PdfPTable table, String label, String value) {
        PdfPCell labelCell = bodyCell(label, true);
        labelCell.setBackgroundColor(TABLE_HEADER);
        table.addCell(labelCell);
        table.addCell(bodyCell(value, false));
    }

    private PdfPCell bodyCell(String text, boolean bold) {
        Font font = new Font(Font.HELVETICA, 8, bold ? Font.BOLD : Font.NORMAL, Color.DARK_GRAY);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        styleCell(cell);
        return cell;
    }

    private void styleCell(PdfPCell cell) {
        cell.setPadding(6);
        cell.setNoWrap(false);
        cell.setBorderColor(BORDER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setLeading(10, 0);
    }

    private PdfPCell imageCell(Image image, float width, float height, int alignment) {
        if (image == null) {
            PdfPCell empty = new PdfPCell(new Phrase(""));
            empty.setBorder(Rectangle.NO_BORDER);
            return empty;
        }
        image.scaleToFit(width, height);
        PdfPCell cell = new PdfPCell(image, false);
        cell.setHorizontalAlignment(alignment);
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private Image loadLogo() {
        try {
            ClassPathResource resource = new ClassPathResource(logoClasspath);
            if (!resource.exists()) {
                log.info("University logo not found at classpath:{}; generating document without a logo", logoClasspath);
                return null;
            }
            try (InputStream input = resource.getInputStream()) {
                Image logo = Image.getInstance(input.readAllBytes());
                logo.setAlignment(Image.ALIGN_LEFT);
                return logo;
            }
        } catch (Exception ex) {
            log.warn("University logo could not be loaded; generating document without a logo", ex);
            return null;
        }
    }

    private Image loadQr(String verificationUrl) {
        try {
            BufferedImage image = qrCodeService.generatePng(verificationUrl);
            return Image.getInstance(image, null);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to embed verification QR code", ex);
        }
    }

    private String feeTypeLabel(Fee fee) {
        return null;
    }

    private boolean matchesFeeDescription(Fee fee, FeeDescriptionRow row) {
        String label = feeTypeLabel(fee);
        if (label == null || label.isBlank()) {
            return false;
        }
        String normalized = label.toLowerCase(Locale.ROOT).trim();
        for (String alias : row.aliases()) {
            if (normalized.equals(alias) || normalized.contains(alias)) {
                return true;
            }
        }
        return false;
    }

    private BigDecimal sumAmountToPay(List<Fee> fees) {
        return fees.stream().map(this::amountToPay).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumAmountPaid(List<Fee> fees) {
        return fees.stream().map(this::amountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal amountToPay(Fee fee) {
        return amountPaid(fee).add(zeroIfNull(fee.getOutstandingBalance()));
    }

    private BigDecimal amountPaid(Fee fee) {
        return zeroIfNull(fee.getAmount());
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String formatDate(LocalDate date) {
        return date == null ? "—" : DATE_FORMAT.format(date);
    }

    private String formatAmount(BigDecimal amount) {
        return zeroIfNull(amount).setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private record FeeDescriptionRow(String label, String... aliases) {}

    private String text(String value) {
        return value == null || value.isBlank() ? "—" : value;
    }

    @FunctionalInterface
    private interface PdfBodyWriter {
        void write(Document document) throws DocumentException;
    }

    private static final class OfficialFooter extends PdfPageEventHelper {
        private final String documentId;

        private OfficialFooter(String documentId) {
            this.documentId = documentId;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfPTable footer = new PdfPTable(new float[] {70, 30});
            footer.setTotalWidth(document.right() - document.left());
            footer.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            Font font = new Font(Font.HELVETICA, 7, Font.NORMAL, MUTED);
            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.TOP);
            left.setBorderColor(GOLD);
            left.setPaddingTop(6);
            left.addElement(new Phrase("Generated by VeriScreen", font));
            left.addElement(new Phrase("Document ID: " + documentId, font));
            left.addElement(new Phrase("Scan the QR code to verify this document.", font));
            footer.addCell(left);

            PdfPCell right = new PdfPCell(new Phrase(
                    "Page " + writer.getPageNumber(), new Font(Font.HELVETICA, 7, Font.BOLD, NAVY)));
            right.setBorder(Rectangle.TOP);
            right.setBorderColor(GOLD);
            right.setPaddingTop(8);
            right.setHorizontalAlignment(Element.ALIGN_RIGHT);
            footer.addCell(right);
            footer.writeSelectedRows(0, -1, document.left(), document.bottom() - 18, writer.getDirectContent());
        }
    }
}
