# Estágio 1: Compilar a aplicação com o Maven
# Usamos uma imagem que já tem o Maven e o Java 17 instalados
FROM maven:3.9-eclipse-temurin-17 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o código do seu projeto para dentro do container
COPY . .

# Executa o comando para compilar e empacotar sua aplicação em um .jar
RUN mvn clean package -DskipTests

# Estágio 2: Criar a imagem final para execução
# Usamos uma imagem leve, apenas com o Java 17 necessário para rodar
FROM openjdk:17-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o arquivo .jar gerado no estágio anterior para a imagem final
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta 8080, que é a porta que sua aplicação usa
EXPOSE 8080

# Comando que será executado quando o container iniciar
ENTRYPOINT ["java","-jar","app.jar"]