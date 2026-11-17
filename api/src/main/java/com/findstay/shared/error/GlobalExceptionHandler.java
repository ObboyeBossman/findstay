package com.findstay.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.lang.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.Clock;
import java.util.List;

/**
 * Turns every exception into the standard {@link ApiError} body. Feature teams never write
 * their own error handling: they throw {@link AppException} (or let validation fail).
 * Unexpected exceptions are logged in full but the client only sees a generic message.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(AppException.class)
    ResponseEntity<ApiError> handleAppException(AppException ex, HttpServletRequest request) {
        return respond(ex.code(), ex.code().httpStatus(), ex.getMessage(), ex.details(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex,
                                                       HttpServletRequest request) {
        List<ApiError.Detail> details = ex.getConstraintViolations().stream()
                .map(v -> new ApiError.Detail(v.getPropertyPath().toString(), v.getMessage()))
                .toList();
        return respond(ErrorCode.VALIDATION_FAILED, 400, "Validation failed", details,
                request.getRequestURI(), null);
    }

    /** Method-level security (e.g. {@code @PreAuthorize}) throws this inside controllers: it is a 403, never a 500. */
    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return respond(ErrorCode.FORBIDDEN, 403, "You do not have permission to do this", List.of(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        return respond(ErrorCode.UNAUTHENTICATED, 401, "Authentication is required", List.of(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {}", request.getRequestURI(), ex);
        return respond(ErrorCode.INTERNAL_ERROR, 500, "An unexpected error occurred", List.of(),
                request.getRequestURI(), null);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status,
            WebRequest request) {
        List<ApiError.Detail> details = ex.getBindingResult().getAllErrors().stream()
                .map(error -> new ApiError.Detail(
                        error instanceof org.springframework.validation.FieldError fieldError
                                ? fieldError.getField()
                                : error.getObjectName(),
                        error.getDefaultMessage()))
                .toList();
        return asObject(respond(ErrorCode.VALIDATION_FAILED, status.value(), "Validation failed",
                details, path(request), headers));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status,
            WebRequest request) {
        // Covers malformed JSON and wrong types, e.g. a decimal where whole pesewas are required.
        return asObject(respond(ErrorCode.VALIDATION_FAILED, status.value(),
                "Request body is missing or malformed", List.of(), path(request), headers));
    }

    /** Every other framework-level error (404 route, 405, 415, ...) ends up here. */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode,
            WebRequest request) {
        int status = statusCode.value();
        if (status >= 500) {
            log.error("Framework error on {}", path(request), ex);
        }
        HttpStatus known = HttpStatus.resolve(status);
        String message = known != null ? known.getReasonPhrase() : "Request failed";
        return asObject(respond(ErrorCode.forStatus(status), status, message, List.of(),
                path(request), headers));
    }

    private ResponseEntity<ApiError> respond(ErrorCode code, int status, String message,
                                             List<ApiError.Detail> details, @Nullable String path,
                                             @Nullable HttpHeaders headers) {
        ApiError body = ApiError.of(code, status, message, clock.instant(), path, details);
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(status);
        if (headers != null) {
            builder.headers(headers);
        }
        return builder.body(body);
    }

    private static ResponseEntity<Object> asObject(ResponseEntity<ApiError> response) {
        return ResponseEntity.status(response.getStatusCode())
                .headers(response.getHeaders())
                .body(response.getBody());
    }

    @Nullable
    private static String path(WebRequest request) {
        return request instanceof ServletWebRequest servletRequest
                ? servletRequest.getRequest().getRequestURI()
                : null;
    }
}
