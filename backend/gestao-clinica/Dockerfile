# Estágio 1: Build
FROM maven:3.9.4-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY backend/gestao-clinica/pom.xml .
COPY backend/gestao-clinica/src ./src
RUN mvn -f pom.xml clean package -DskipTests

# Estágio 2: Run
FROM alpine/java:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]