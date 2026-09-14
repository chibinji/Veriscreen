package com.veriscreen.backend.service.notify;

import com.veriscreen.backend.dto.NotificationDto;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.entity.StudentNotification;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.repository.StudentNotificationRepository;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class NotificationService {

    private final StudentNotificationRepository notificationRepository;

    public NotificationService(StudentNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notifySmsAndEmail(Student student, String title, String message, String type, String link) {
        String phone = student.getPhone() == null || student.getPhone().isBlank() ? "unregistered" : student.getPhone();
        String email = student.getEmail() == null || student.getEmail().isBlank() ? "unregistered" : student.getEmail();
        log.info("SMS to {} for student {}: {}", phone, student.getId(), message);
        log.info("EMAIL to {} for student {}: {} — {}", email, student.getId(), title, message);
        save(student, title, message + " An SMS was sent to " + phone + ".", type, "SMS", link);
        save(student, title, message + " An email was sent to " + email + ".", type, "EMAIL", link);
        save(student, title, message, type, "IN_APP", link);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> list(String studentId) {
        return notificationRepository.findByStudent_IdOrderByCreatedAtDesc(studentId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void markRead(String studentId, Long id) {
        StudentNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getStudent().getId().equals(studentId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setReadFlag(true);
        notificationRepository.save(notification);
    }

    private void save(Student student, String title, String message, String type, String channel, String link) {
        StudentNotification notification = new StudentNotification();
        notification.setStudent(student);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setChannel(channel);
        notification.setReadFlag(false);
        notification.setLink(link);
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    private NotificationDto toDto(StudentNotification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .channel(notification.getChannel())
                .read(notification.isReadFlag())
                .link(notification.getLink())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
