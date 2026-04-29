package com.uniSpaceHub.demo.service.impl;

import com.uniSpaceHub.demo.dto.booking.*;
import com.uniSpaceHub.demo.model.booking.Booking;
import com.uniSpaceHub.demo.model.booking.BookingCheckIn;
import com.uniSpaceHub.demo.model.booking.BookingStatusHistory;
import com.uniSpaceHub.demo.model.booking.BookingStatus;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;

import com.uniSpaceHub.demo.exception.booking.BookingConflictException;
import com.uniSpaceHub.demo.exception.booking.BookingNotFoundException;
import com.uniSpaceHub.demo.exception.booking.InvalidBookingStateException;
import com.uniSpaceHub.demo.repository.booking.BookingCheckInRepository;
import com.uniSpaceHub.demo.repository.booking.BookingRepository;
import com.uniSpaceHub.demo.repository.booking.BookingStatusHistoryRepository;
import com.uniSpaceHub.demo.repository.UserRepository;
import com.uniSpaceHub.demo.repository.FacilityRepository;
import com.uniSpaceHub.demo.service.BookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for student-level booking operations.
 *
 * <p>
 * Manages the core booking lifecycle from the student's perspective: creating
 * new
 * bookings, updating pending bookings, cancelling approved or pending bookings,
 * and
 * retrieving booking details and QR check-in tokens.
 * </p>
 *
 * <p>
 * Conflict detection is enforced on every create and update to prevent
 * double-booking
 * of the same resource. All write operations are wrapped in
 * {@code @Transactional}.
 * Read-only queries use {@code @Transactional(readOnly = true)} for
 * performance.
 * </p>
 *
 * @see BookingService
 * @see com.uniSpaceHub.demo.controller.booking.BookingController
 * @see com.uniSpaceHub.demo.service.impl.AdminBookingServiceImpl
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponse createBooking(CreateBookingRequest request) {
        log.info("Creating new booking for user {} on facility {}", request.getUserId(), request.getFacilityId());

        validateBookingRules(request.getBookingDate(), request.getStartTime(), request.getEndTime());

        Facility facility = resolveFacilityForBooking(request.getFacilityId());
        User user = resolveUserForBooking(request.getUserId());

        checkForConflicts(facility.getId(), request.getBookingDate(), request.getStartTime(),
                request.getEndTime(), null);

        Booking booking = Booking.builder()
                .bookingCode(generateUniqueCode())
                .user(user)
                .facility(facility)
            .facilityId(facility.getId())
            .userId(user.getId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .studentName(request.getStudentName())
                .studentRegNumber(request.getStudentRegNumber())
                .build();

        Booking saved = bookingRepository.save(booking);

        recordHistory(saved.getId(), null, BookingStatus.PENDING, String.valueOf(user.getId()), "Initial creation");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(String bookingCode, UpdateBookingRequest request) {
        log.info("Updating booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only PENDING bookings can be updated.");
        }

        validateBookingRules(request.getBookingDate(), request.getStartTime(), request.getEndTime());

        checkForConflicts(request.getFacilityId(), request.getBookingDate(), request.getStartTime(),
                request.getEndTime(), booking.getId());

        Facility facility = resolveFacilityForBooking(request.getFacilityId());

        booking.setFacility(facility);
        booking.setFacilityId(request.getFacilityId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        Booking saved = bookingRepository.save(booking);

        recordHistory(saved.getId(), BookingStatus.PENDING, BookingStatus.PENDING, booking.getUserId().toString(),
                "User updated booking details");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(String bookingCode, String cancelledBy) {
        log.info("Cancelling booking {}", bookingCode);
        Booking booking = getBookingEntity(bookingCode);

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingStateException("Only APPROVED or PENDING bookings can be cancelled.");
        }

        BookingStatus oldStatus = booking.getStatus();

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(cancelledBy);
        booking.setCancelledAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        recordHistory(saved.getId(), oldStatus, BookingStatus.CANCELLED, cancelledBy, "User cancelled booking");

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return mapToResponse(getBookingEntity(bookingCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingSummaryResponse> getUserBookings(String userId) {
        try {
            Long userIdLong = Long.parseLong(userId);
            return bookingRepository.findByUserId(userIdLong).stream()
                    .map(this::mapToSummaryResponse)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            throw new InvalidBookingStateException("Invalid user ID format. Must be a numeric value: " + userId, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookingQrResponse getBookingQrToken(String bookingCode) {
        Booking booking = getBookingEntity(bookingCode);

        if (booking.getStatus() != BookingStatus.APPROVED || booking.getQrToken() == null) {
            throw new InvalidBookingStateException("QR token is not available. Booking must be APPROVED.");
        }

        String qrBase64 = generateQRCodeImageBase64(booking.getQrToken());

        return BookingQrResponse.builder()
                .bookingCode(bookingCode)
                .qrToken(qrBase64)
                .build();
    }

    private String generateQRCodeImageBase64(String token) {
        try {
            int width = 300, height = 300;

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    "CHECKIN_TOKEN:" + token,
                    BarcodeFormat.QR_CODE, width, height);

            java.io.ByteArrayOutputStream pngOutputStream = new java.io.ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();

            return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(pngData);
        } catch (com.google.zxing.WriterException e) {
            log.error("Failed to encode QR code for token: {}", token, e);
            throw new InvalidBookingStateException("Failed to generate QR code: " + e.getMessage(), e);
        } catch (java.io.IOException e) {
            log.error("Failed to write QR code image for token: {}", token, e);
            throw new InvalidBookingStateException("Failed to write QR code image: " + e.getMessage(), e);
        }
    }

    private void recordHistory(Long bookingId, BookingStatus oldStatus, BookingStatus newStatus, String changedBy,
            String reason) {
        historyRepository.save(BookingStatusHistory.builder()
                .bookingId(bookingId)
                .previousStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .reason(reason)
                .changedAt(LocalDateTime.now())
                .build());
    }

    private Booking getBookingEntity(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new BookingNotFoundException("Booking specific code not found: " + bookingCode));
    }

    private void validateBookingRules(LocalDate date, java.time.LocalTime start, java.time.LocalTime end) {
        if (date.isBefore(LocalDate.now())) {
            throw new InvalidBookingStateException("Booking date cannot be in the past.");
        }
        if (!end.isAfter(start)) {
            throw new InvalidBookingStateException("End time must be after start time.");
        }
    }

    private void checkForConflicts(Long facilityId, LocalDate date, java.time.LocalTime start,
            java.time.LocalTime end, Long excludeId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facilityId, date, start, end, List.of(BookingStatus.APPROVED, BookingStatus.PENDING), excludeId);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "The selected time slot conflicts with an existing approved or pending booking.");
        }
    }

    private String generateUniqueCode() {
        return "BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

        private User resolveUserForBooking(Long requestedUserId) {
        if (requestedUserId != null) {
            return userRepository.findById(requestedUserId)
                .orElseGet(() -> userRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
                    .orElseThrow(() -> new InvalidBookingStateException(
                        "Requested user ID " + requestedUserId + " does not exist, and no fallback user is available.")));
        }

        return userRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
            .orElseThrow(() -> new InvalidBookingStateException(
                "No users are available in the database to attach this booking."));
        }

        private Facility resolveFacilityForBooking(Long requestedFacilityId) {
        if (requestedFacilityId != null) {
            return facilityRepository.findById(requestedFacilityId)
                .orElseGet(() -> facilityRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
                    .orElseThrow(() -> new InvalidBookingStateException(
                        "Requested facility ID " + requestedFacilityId + " does not exist, and no fallback facility is available.")));
        }

        return facilityRepository.findAll(PageRequest.of(0, 1)).stream().findFirst()
            .orElseThrow(() -> new InvalidBookingStateException(
                "No facilities are available in the database to attach this booking."));
        }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .facilityId(b.getFacilityId())
                .userId(b.getUserId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .expectedAttendees(b.getExpectedAttendees())
                .status(b.getStatus())
                .adminDecisionReason(b.getAdminDecisionReason())
                .qrToken(b.getQrToken())
                .checkedInAt(b.getCheckedInAt())
                .approvedAt(b.getApprovedAt())
                .approvedBy(b.getApprovedBy())
                .rejectedAt(b.getRejectedAt())
                .rejectedBy(b.getRejectedBy())
                .cancelledAt(b.getCancelledAt())
                .cancelledBy(b.getCancelledBy())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .studentName(b.getStudentName())
                .studentRegNumber(b.getStudentRegNumber())
                .build();
    }

    private BookingSummaryResponse mapToSummaryResponse(Booking b) {
        return BookingSummaryResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .facilityId(b.getFacilityId())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .hasConflict(false) // Never checked externally for raw generic user lists to save DB loads
                .studentName(b.getStudentName())
                .studentRegNumber(b.getStudentRegNumber())
                .build();
    }
}
