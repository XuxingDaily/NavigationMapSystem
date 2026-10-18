package zhaolong.dai.nav.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI navigationOpenAPI() {
        return new OpenAPI()
            .info(
                new Info()
                    .title("导航地图系统 API")
                    .description("POI查询、道路吸附、路径规划和多点游览规划接口")
                    .version("1.0.0")
                    .contact(new Contact().name("Zhaolong"))
            );
    }
}
