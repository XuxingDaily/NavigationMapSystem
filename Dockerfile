FROM maven:3.9.16-eclipse-temurin-21-alpine AS builder

WORKDIR /workspace

COPY pom.xml ./
COPY nav-common/pom.xml nav-common/pom.xml
COPY nav-pojo/pom.xml nav-pojo/pom.xml
COPY nav-server/pom.xml nav-server/pom.xml

# Cache third-party Maven dependencies separately from application source code.
RUN mvn -B -ntp -pl nav-server -am dependency:go-offline

COPY nav-common/src nav-common/src
COPY nav-pojo/src nav-pojo/src
COPY nav-server/src nav-server/src

RUN mvn -B -ntp -pl nav-server -am clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine AS runtime

RUN apk add --no-cache curl \
    && addgroup -S nav \
    && adduser -S -G nav nav

WORKDIR /app

COPY --from=builder /workspace/nav-server/target/nav-server-*.jar /app/app.jar

USER nav:nav

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
