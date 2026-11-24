# ---------- Stage 1: build the jar ----------
FROM docker.io/library/maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---------- Stage 2: slim runtime ----------
FROM docker.io/library/eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/joinee-backend.jar app.jar

# H2 database files live here; mounted as a named volume in compose.yaml
RUN mkdir -p /data
ENV H2_DB_PATH=/data/joineedb \
    JAVA_OPTS=""

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
