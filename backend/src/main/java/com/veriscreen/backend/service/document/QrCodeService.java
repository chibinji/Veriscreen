package com.veriscreen.backend.service.document;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import java.awt.image.BufferedImage;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class QrCodeService {

    private static final int SIZE = 240;

    public BufferedImage generatePng(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    SIZE,
                    SIZE,
                    Map.of(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M, EncodeHintType.MARGIN, 1));
            return MatrixToImageWriter.toBufferedImage(matrix);
        } catch (WriterException ex) {
            throw new IllegalStateException("Unable to generate verification QR code", ex);
        }
    }
}
