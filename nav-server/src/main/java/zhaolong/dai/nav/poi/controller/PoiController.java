package zhaolong.dai.nav.poi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import zhaolong.dai.nav.dto.poi.PoiNearbyDTO;
import zhaolong.dai.nav.dto.poi.PoiKeywordDTO;
import zhaolong.dai.nav.dto.poi.PoiViewportDTO;
import zhaolong.dai.nav.result.Result;
import zhaolong.dai.nav.poi.service.PoiService;
import zhaolong.dai.nav.vo.poi.PoiListVO;
import zhaolong.dai.nav.vo.poi.PoiVO;

@Tag(
    name = "POI",
    description = "POI 搜索和详情搜索等"
)
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/pois")
public class PoiController {

    private final PoiService poiService;

    @Operation(
            summary = "关键字搜索POI",
            description = "根据名称关键词查询有效 POI"
    )
    @GetMapping
    public Result<PoiListVO> searchByKeyword(@Valid @ModelAttribute PoiKeywordDTO query) {
        return Result.success(poiService.getByKeyword(query));
    }

    @Operation(
            summary = "附近 POI 查询",
            description = "根据指定 x、y 坐标以及指定半径，查询指定数量的 POI 结果"
    )
    @GetMapping("/nearby")
    public Result<PoiListVO> searchByNearby(@Valid @ModelAttribute PoiNearbyDTO query) {
        return Result.success(poiService.getByNearby(query));
    }

    @Operation(
            summary = "视口 POI 查询",
            description = "根据指定视口范围，查询指定数量的 POI 结果"
    )
    @GetMapping("/viewport")
    public Result<PoiListVO> searchByViewport(@Valid @ModelAttribute PoiViewportDTO query) {
        return Result.success(poiService.getByViewport(query));
    }

    @Operation(summary = "根据 ID 查询 POI 详情")
    @GetMapping("/{id}")
    public Result<PoiVO> getPoi(@PathVariable Long id) {
        return Result.success(poiService.getById(id));
    }



}
