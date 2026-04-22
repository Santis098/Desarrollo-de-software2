# syntax=docker/dockerfile:1.6

# =========================================================
# Stage 1: build the Spring Boot jar with Maven + JDK 17
# =========================================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copia primero los descriptores para aprovechar la cache de dependencias
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
RUN mvn -B -q dependency:go-offline

# Copia el codigo y empaqueta
COPY src ./src
RUN mvn -B -q clean package -DskipTests \
 && cp target/*.jar app.jar

# =========================================================
# Stage 2: runtime liviano con JRE 17
# =========================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

# Usuario no-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/app.jar /app/app.jar

# Render inyecta PORT en runtime; Spring lo lee desde application.properties (${PORT:8080})
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080

ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
