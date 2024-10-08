# Usando uma imagem base oficial do Node.js
FROM node:18

# Definir o diretório de trabalho no container
WORKDIR /usr/src/app

# Copiar o package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código fonte
COPY . .

# Expor a porta que o servidor vai usar
EXPOSE 80

# Comando para iniciar o servidor
CMD ["npm", "start"]