FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate 
RUN npm run build
RUN npm run build || (echo "Build failed, check logs" && exit 1)
EXPOSE 3000
CMD ["npm", "start"]