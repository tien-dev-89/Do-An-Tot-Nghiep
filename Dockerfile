FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ build-base
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]