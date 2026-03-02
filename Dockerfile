FROM node:24

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

CMD ["pnpm", "start"]
