package zhaolong.dai.nav.exception;

/** 两点路径规划的请求参数或约束不合法。 */
public class RoutePlanningException extends RuntimeException {

    public RoutePlanningException(String message) {
        super(message);
    }
}
