package zhaolong.dai.nav.exception;

/** 多点游览规划的请求参数或约束组合不合法。 */
public class TourPlanningException extends RuntimeException {

    public TourPlanningException(String message) {
        super(message);
    }
}
