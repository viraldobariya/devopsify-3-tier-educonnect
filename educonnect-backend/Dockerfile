# Stage 1: Build the Spring Boot application using Maven
FROM maven:3.9.2-eclipse-temurin-20 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml first for caching dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application (skip tests; tests run in CI/CD pipelines)
RUN mvn clean package -DskipTests

# Stage 2: Create lightweight runtime image
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (match your Spring Boot server.port)
EXPOSE 8080

# Use JVM optimizations for production
ENTRYPOINT ["java","-jar","app.jar"]