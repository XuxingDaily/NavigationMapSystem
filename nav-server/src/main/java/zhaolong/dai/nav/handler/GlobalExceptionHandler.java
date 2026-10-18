package zhaolong.dai.nav.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.exception.PoiNotFoundException;
import zhaolong.dai.nav.exception.RoadSnapException;
import zhaolong.dai.nav.exception.RoutePlanningException;
import zhaolong.dai.nav.exception.RoutingNotFoundException;
import zhaolong.dai.nav.exception.TourPlanningException;
import zhaolong.dai.nav.result.Result;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({PoiNotFoundException.class, RoutingNotFoundException.class})
    public ResponseEntity<Result<Object>> handleNotFound(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Result.error(e.getMessage()));
    }

    @ExceptionHandler({
            RoadSnapException.class,
            RoutePlanningException.class,
            TourPlanningException.class,
            IllegalArgumentException.class,
            BindException.class
    })
    public ResponseEntity<Result<Object>> handleBadRequest(Exception e) {
        String message = e instanceof BindException validationException
                ? validationException.getBindingResult().getAllErrors().stream()
                    .findFirst()
                    .map(error -> error.getDefaultMessage())
                    .orElse(MessageConstants.REQUEST_PARAMETER_INVALID)
                : e.getMessage();
        return ResponseEntity.badRequest().body(Result.error(message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Result<Object>> handleUnreadableRequest() {
        return ResponseEntity.badRequest()
                .body(Result.error(MessageConstants.REQUEST_PARAMETER_INVALID));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Object>> globalExceptionHandler(Exception e) {
        log.error(MessageConstants.INTERNAL_SERVER_ERROR, e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error(MessageConstants.INTERNAL_SERVER_ERROR));
    }

}
