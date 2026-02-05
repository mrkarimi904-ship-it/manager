FROM docker.arvancloud.ir/node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN rm -rf node_modules

FROM docker.arvancloud.ir/node:20-alpine as deploy
EXPOSE 3001
WORKDIR /app
COPY --from=build /app /app
RUN npm install --omit=dev
RUN npx prisma generate
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh
CMD ["/app/startup.sh"]