FROM node:14

ENV API_KEY=hardcoded_secret_key_abc123
ENV DB_PASSWORD=SuperSecretPass1234

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]