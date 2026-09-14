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
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Student;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class HelsbContractPdfService {

    private static final Color NAVY = new Color(7, 30, 66);
    private static final Color ORANGE = new Color(232, 119, 34);
    private static final Color MUTED = new Color(82, 90, 102);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMMM yyyy");
    private static final String LOGO_PATH = "static/images/helsb-logo.png";

    public byte[] render(Student student, HelsbApplication application) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 48, 48, 72, 56);
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new ContractFooter(application.getApplicationNumber()));
            document.open();
            writePageOne(document, student, application);
            document.newPage();
            writePageTwo(document, application);
            document.newPage();
            writePageThree(document, student, application);
            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate HELSB loan contract", ex);
        }
    }

    private void writePageOne(Document document, Student student, HelsbApplication application) throws DocumentException {
        Font title = new Font(Font.HELVETICA, 16, Font.BOLD, NAVY);
        Font subtitle = new Font(Font.HELVETICA, 10, Font.BOLD, ORANGE);
        Font heading = new Font(Font.HELVETICA, 12, Font.BOLD, NAVY);
        Font body = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);

        addLogo(document, 96);
        Paragraph banner = new Paragraph("HIGHER EDUCATION LOANS AND SCHOLARSHIP BOARD", title);
        banner.setAlignment(Element.ALIGN_CENTER);
        document.add(banner);
        Paragraph sub = new Paragraph("STUDENT LOAN AGREEMENT", subtitle);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(8);
        document.add(sub);
        Paragraph intro = new Paragraph(
                "This three-page contract records the student loan awarded to the beneficiary named below "
                        + "for tuition and approved living support while registered at a recognised higher education institution in Zambia.",
                body);
        intro.setSpacingAfter(12);
        document.add(intro);

        document.add(new Paragraph("1. Student details", heading));
        document.add(detailsTable(new String[][] {
                {"Full name", text(student.getName())},
                {"Student number", text(student.getId())},
                {"National Registration Card", text(student.getNrc())},
                {"Programme", text(student.getProgram())},
                {"School / faculty", text(student.getFaculty())},
                {"Email", text(student.getEmail())},
                {"Mobile number", text(student.getPhone())},
                {"HELSB loan number", text(application.getApplicationNumber())},
                {"Loan award", percent(application.getLoanPercent()) + " student loan"},
                {"Academic year", String.valueOf(LocalDate.now().getYear()) + "/" + (LocalDate.now().getYear() + 1)},
                {"Date of agreement", DATE.format(LocalDate.now())},
        }));

        document.add(new Paragraph("2. What this loan is about", heading));
        document.add(paragraph(
                "The Higher Education Loans and Scholarship Board (HELSB) is providing a recoverable student loan "
                        + "to help the beneficiary meet tuition, registration and approved living costs for the programme named above. "
                        + "The award percentage (" + percent(application.getLoanPercent()) + ") is the share of approved costs that HELSB will cover. "
                        + "Any remaining balance remains the responsibility of the student. This loan is not a grant. "
                        + "It must be repaid after studies on the terms in this agreement.",
                body));
    }

    private void writePageTwo(Document document, HelsbApplication application) throws DocumentException {
        Font heading = new Font(Font.HELVETICA, 12, Font.BOLD, NAVY);
        Font body = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);

        addLogo(document, 64);
        document.add(new Paragraph("3. How the loan is paid out", heading));
        document.add(paragraph(
                "HELSB may pay tuition directly to the institution and living support to the beneficiary through an approved channel, "
                        + "including mobile money. Disbursement depends on continued registration, satisfactory academic progress, "
                        + "and confirmation of documents submitted through VeriScreen. False information may stop payment immediately.",
                body));

        document.add(new Paragraph("4. How to pay the loan back", heading));
        document.add(paragraph(
                "Repayment begins after the beneficiary completes, withdraws from, or is discontinued from the programme, "
                        + "or six months after the last disbursement, whichever is earlier. The beneficiary must keep HELSB informed "
                        + "of employment, address and phone number. Monthly instalments are calculated from the outstanding balance, "
                        + "the award percentage of " + percent(application.getLoanPercent()) + ", and the repayment schedule issued with the first demand notice. "
                        + "Early repayment is allowed without penalty. Default may result in recovery through the employer, "
                        + "the Zambia Revenue Authority, or civil proceedings.",
                body));

        document.add(new Paragraph("5. How the loan can be revoked", heading));
        document.add(paragraph(
                "HELSB may suspend or revoke this loan if the beneficiary: (a) provides false academic or personal information; "
                        + "(b) fails to remain registered; (c) is dismissed for academic or disciplinary reasons; "
                        + "(d) uses funds for purposes other than approved education costs; "
                        + "(e) fails to submit required screening documents; or (f) does not sign this contract, including next-of-kin acknowledgement. "
                        + "Revocation makes the amount already paid immediately due.",
                body));

        document.add(new Paragraph("6. Student obligations", heading));
        document.add(paragraph(
                "The beneficiary must remain a full-time registered student, sit examinations when eligible, report a change of programme, "
                        + "and cooperate with HELSB screening officers. The next of kin named on page 3 acknowledges this loan and "
                        + "agrees to help HELSB contact the beneficiary if repayment falls into arrears.",
                body));
    }

    private void writePageThree(Document document, Student student, HelsbApplication application)
            throws DocumentException {
        Font heading = new Font(Font.HELVETICA, 12, Font.BOLD, NAVY);
        Font body = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
        Font muted = new Font(Font.HELVETICA, 8, Font.ITALIC, MUTED);

        addLogo(document, 64);
        document.add(new Paragraph("7. Next of kin details", heading));
        document.add(detailsTable(new String[][] {
                {"Full name", text(student.getNextOfKinName())},
                {"Relationship", text(student.getNextOfKinRelationship())},
                {"NRC", text(student.getNextOfKinNrc())},
                {"Phone", text(student.getNextOfKinPhone())},
                {"Address", text(student.getNextOfKinAddress())},
                {"Student linked to this loan", text(student.getName()) + " (" + text(student.getId()) + ")"},
                {"HELSB loan number", text(application.getApplicationNumber())},
        }));

        document.add(new Paragraph("8. Signatures", heading));
        document.add(paragraph(
                "By signing, the parties confirm that they have read this three-page agreement and that the information is true.",
                body));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(16);
        table.addCell(signatureCell("HELSB Chief Executive Officer", "Dr. Chanda P. Mwila", true));
        table.addCell(signatureCell("Loan beneficiary", text(student.getName()), false));
        table.addCell(emptyCell());
        table.addCell(signatureCell("Next of kin", text(student.getNextOfKinName()), false));
        document.add(table);

        Paragraph note = new Paragraph(
                "Official HELSB student loan contract generated through VeriScreen. Keep a signed copy for your records.",
                muted);
        note.setSpacingBefore(18);
        document.add(note);
    }

    private PdfPCell signatureCell(String role, String name, boolean ceo) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(10);
        cell.setMinimumHeight(110);
        Font roleFont = new Font(Font.HELVETICA, 9, Font.BOLD, NAVY);
        Font nameFont = new Font(Font.TIMES_ROMAN, 13, Font.ITALIC, ceo ? ORANGE : Color.DARK_GRAY);
        Font lineFont = new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED);
        cell.addElement(new Paragraph(role, roleFont));
        if (ceo) {
            Paragraph signed = new Paragraph(name, nameFont);
            signed.setSpacingBefore(18);
            cell.addElement(signed);
        } else {
            Paragraph gap = new Paragraph(" ", nameFont);
            gap.setSpacingBefore(22);
            cell.addElement(gap);
        }
        cell.addElement(new Paragraph("______________________________", lineFont));
        cell.addElement(new Paragraph(ceo ? "Signed for HELSB" : "Signature and date", lineFont));
        cell.addElement(new Paragraph(name, new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED)));
        return cell;
    }

    private PdfPCell emptyCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private PdfPTable detailsTable(String[][] rows) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] {34, 66});
        table.setWidthPercentage(100);
        table.setSpacingBefore(8);
        table.setSpacingAfter(14);
        Font label = new Font(Font.HELVETICA, 9, Font.BOLD, NAVY);
        Font value = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
        for (String[] row : rows) {
            PdfPCell left = new PdfPCell(new Phrase(row[0], label));
            PdfPCell right = new PdfPCell(new Phrase(row[1], value));
            left.setBorderColor(new Color(220, 226, 232));
            right.setBorderColor(new Color(220, 226, 232));
            left.setPadding(6);
            right.setPadding(6);
            table.addCell(left);
            table.addCell(right);
        }
        return table;
    }

    private Paragraph paragraph(String text, Font font) {
        Paragraph paragraph = new Paragraph(text, font);
        paragraph.setSpacingBefore(6);
        paragraph.setSpacingAfter(10);
        paragraph.setLeading(14);
        return paragraph;
    }

    private String text(String value) {
        return value == null || value.isBlank() ? "—" : value;
    }

    private String percent(Integer value) {
        return (value == null ? 50 : value) + "%";
    }

    private void addLogo(Document document, float size) throws DocumentException {
        Image logo = loadLogo();
        if (logo == null) {
            return;
        }
        logo.scaleToFit(size, size);
        logo.setAlignment(Image.ALIGN_CENTER);
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingAfter(8);
        PdfPCell cell = new PdfPCell(logo, false);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPaddingBottom(4);
        table.addCell(cell);
        document.add(table);
    }

    private Image loadLogo() {
        try {
            ClassPathResource resource = new ClassPathResource(LOGO_PATH);
            if (!resource.exists()) {
                log.info("HELSB logo not found at classpath:{}; generating contract without a logo", LOGO_PATH);
                return null;
            }
            try (InputStream input = resource.getInputStream()) {
                Image logo = Image.getInstance(input.readAllBytes());
                logo.setAlignment(Image.ALIGN_CENTER);
                return logo;
            }
        } catch (Exception ex) {
            log.warn("HELSB logo could not be loaded; generating contract without a logo", ex);
            return null;
        }
    }

    private static final class ContractFooter extends PdfPageEventHelper {
        private final String loanNumber;

        private ContractFooter(String loanNumber) {
            this.loanNumber = loanNumber == null ? "HELSB-LOAN" : loanNumber;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContent();
            canvas.setColorStroke(ORANGE);
            canvas.setLineWidth(1.2f);
            canvas.moveTo(document.left(), document.top() + 12);
            canvas.lineTo(document.right(), document.top() + 12);
            canvas.stroke();

            Font font = new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED);
            PdfPTable footer = new PdfPTable(2);
            footer.setTotalWidth(document.right() - document.left());
            PdfPCell left = new PdfPCell(new Phrase("HELSB loan contract · " + loanNumber, font));
            PdfPCell right = new PdfPCell(new Phrase("Page " + writer.getPageNumber() + " of 3", font));
            left.setBorder(Rectangle.TOP);
            right.setBorder(Rectangle.TOP);
            left.setBorderColor(NAVY);
            right.setBorderColor(NAVY);
            right.setHorizontalAlignment(Element.ALIGN_RIGHT);
            left.setPaddingTop(6);
            right.setPaddingTop(6);
            footer.addCell(left);
            footer.addCell(right);
            footer.writeSelectedRows(0, -1, document.left(), document.bottom() - 18, writer.getDirectContent());
        }
    }
}
