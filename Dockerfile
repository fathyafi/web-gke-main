# Build Stage dari tito
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
ENV VUE_APP_SERVICE_API=
RUN yarn build

# Production Stage - Node.js Serve Static
FROM node:20-alpine AS production-stage
WORKDIR /app


# Install 'serve' (static file server)
RUN yarn global add serve

# Copy build result from build-stage
COPY --from=build-stage /app/dist /app/dist

EXPOSE 3000

# Jalankan 'serve' untuk hasil build di folder /app/dist
CMD ["serve", "-s", "dist", "-l", "3000"]
