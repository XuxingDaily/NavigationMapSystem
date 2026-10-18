package zhaolong.dai.nav.routing.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import zhaolong.dai.nav.dto.routing.RouteRequestDTO;
import zhaolong.dai.nav.dto.routing.SnapRequestDTO;
import zhaolong.dai.nav.dto.routing.TourRequestDTO;
import zhaolong.dai.nav.result.Result;
import zhaolong.dai.nav.routing.service.RoadSnapService;
import zhaolong.dai.nav.routing.service.RoutePlanningService;
import zhaolong.dai.nav.routing.service.TourPlanningService;
import zhaolong.dai.nav.vo.routing.RouteVO;
import zhaolong.dai.nav.vo.routing.SnappedPointVO;
import zhaolong.dai.nav.vo.routing.TourPlanVO;

@Tag(
        name = "Routing",
        description = "路径规划模块，包含最短路径计算、多点目标排序优化等"
)
@RestController
@RequestMapping("/api/v1/routing")
@RequiredArgsConstructor
public class RoutingController {

    private final RoadSnapService roadSnapService;
    private final RoutePlanningService routePlanningService;
    private final TourPlanningService tourPlanningService;

    @Operation(summary = "道路吸附", description = "将局部坐标吸附到指定出行方式可通行的最近道路")
    @PostMapping("/snap")
    public Result<SnappedPointVO> snap(@Valid @RequestBody SnapRequestDTO request) {
        return Result.success(roadSnapService.snap(request));
    }

    @Operation(summary = "两点路径规划", description = "支持 POI 或局部坐标作为起终点")
    @PostMapping("/routes")
    public Result<RouteVO> route(@Valid @RequestBody RouteRequestDTO request) {
        return Result.success(routePlanningService.route(request));
    }

    @Operation(summary = "多点游览规划", description = "计算路网成本矩阵，并用 Held-Karp 或 NN + 2-opt 优化最多 50 个点的访问顺序")
    @PostMapping("/tours")
    public Result<TourPlanVO> planTour(@Valid @RequestBody TourRequestDTO request) {
        return Result.success(tourPlanningService.planTour(request));
    }
}
