# Estágio 1: Build da aplicação
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia o pom.xml e baixa as dependências (otimiza o cache do Docker)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte
COPY src ./src

# Compila o projeto gerando o .jar (ignorando os testes para ser mais rápido no deploy)
RUN mvn clean package -DskipTests

# Estágio 2: Imagem final (mais leve) para rodar a aplicação
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia o .jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080 (o Render detectará essa porta automaticamente)
EXPOSE 8080

# Comando que inicia o Spring Boot quando o container for iniciado
ENTRYPOINT ["java", "-jar", "app.jar"]
