package zhaolong.dai.nav.constans;

public class MessageConstants {

    private MessageConstants() {
    }

    public static final String SUCCESS = "success";
    public static final String REQUEST_PARAMETER_INVALID = "请求参数不合法";
    public static final String INTERNAL_SERVER_ERROR = "服务器内部错误";

    public static final String POI_SEARCH_KEYWORD_LENGTH_LIMIT = "关键词不能超过100个字符";
    public static final String POI_SEARCH_LIMIT_MIN = "返回数量不能小于 1";
    public static final String POI_SEARCH_LIMIT_MAX = "返回数量不能大于 10000";

    public static final String POI_NOT_FOUND_MSG = "POI 不存在或已停用";

    public static final String POINT_COORDINATE_ERROR = "局部坐标 x、y 必须是有限数值";
    public static final String POINT_X_REQUIRED = "局部坐标 x 不能为空";
    public static final String POINT_Y_REQUIRED = "局部坐标 y 不能为空";

    public static final String ROAD_POINT_IS_NULL = "路径点不能为空";
    public static final String ROAD_POINT_IS_ERROR = "路径点的 poiId 和 point 必须且只能填写一个";
    public static final String SNAP_POINT_REQUIRED = "待吸附坐标不能为空";
    public static final String ROUTE_ORIGIN_REQUIRED = "路线起点不能为空";
    public static final String ROUTE_DESTINATION_REQUIRED = "路线终点不能为空";
    public static final String POI_COORDINATE_MISSING = "POI 缺少可用于路径规划的局部坐标";
    public static final String SNAP_DISTANCE_INVALID = "最大吸附距离必须大于 0";
    public static final String ROAD_NOT_FOUND_IN_SNAP_RANGE = "指定位置在最大吸附距离内没有可通行道路";

    public static final String ROUTE_NOT_FOUND = "起点和终点之间不存在可通行路径";
    public static final String ROUTE_ENDPOINT_REQUIRED = "路线起点和终点不能为空";

    public static final String TOUR_STOPS_REQUIRED = "游览点列表不能为空";
    public static final String TOUR_STOP_COUNT_INVALID = "游览点数量必须在 2 到 50 之间";
    public static final String TOUR_ROUTE_NOT_FOUND = "所选路径点之间不存在完整可达的游览路线";
    public static final String COST_MATRIX_SIZE_INVALID = "成本矩阵规模必须在 2 到 12 之间";
    public static final String HEURISTIC_COST_MATRIX_SIZE_INVALID = "NN + 2-opt 成本矩阵规模必须在 2 到 50 之间";
    public static final String COST_MATRIX_NOT_SQUARE = "成本矩阵必须是方阵";
    public static final String COST_MATRIX_VALUE_INVALID = "成本矩阵只能包含非负有限成本或正无穷";
    public static final String HELD_KARP_POINT_LIMIT = "Held-Karp 精确算法最多支持 12 个游览点";
    public static final String HEURISTIC_ROUTE_NOT_FOUND = "NN + 2-opt 未能构造覆盖全部路径点的可达路线";
    public static final String TOUR_START_INDEX_OUT_OF_RANGE = "固定起点下标超出 stops 范围";
    public static final String TOUR_END_INDEX_OUT_OF_RANGE = "固定终点下标超出 stops 范围";
    public static final String ROUND_TRIP_END_CONFLICT = "闭环游览不能同时指定固定终点";
    public static final String OPEN_TOUR_SAME_ENDPOINT = "非闭环游览的起点和终点不能相同";

    public static final String MAP_LAYER_NOT_FOUND = "地图图层不存在或已停用";
    public static final String TILE_ZOOM_INVALID = "瓦片层级必须位于 0 到 22 之间";
    public static final String TILE_COORDINATE_INVALID = "瓦片 x、y 必须位于当前层级的有效范围内";

}
