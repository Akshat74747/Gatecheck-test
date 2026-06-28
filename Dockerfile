FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl nodejs npm

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3000
CMD ["node", "app.js"]
