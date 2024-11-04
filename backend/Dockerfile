FROM node:21-alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 5001
CMD ["npm","run","dev"]