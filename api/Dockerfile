# The quotation service, as one image.
#
# The service imports the site's pure pricing modules from ../src/lib by
# relative path, so the build context is the repository root and both trees
# are copied in. Nothing in the Next app is built here; only what the API
# reaches for.
FROM node:22-alpine
WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json api/
RUN pnpm install --frozen-lockfile --filter quotation-api...

COPY src/lib src/lib
COPY src/types src/types
COPY api api
RUN cd api && pnpm db:generate

WORKDIR /repo/api
EXPOSE 4000
# Apply migrations, then serve. The ingest runs on its own schedule and can
# be triggered with POST /v1/ingest/run.
CMD ["sh", "-c", "pnpm db:deploy && pnpm start"]
