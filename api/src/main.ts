import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.ts";

/**
 * The quotation service.
 *
 * The portfolio site prices a shipment in the browser with a pure function.
 * This is the same function behind an HTTP boundary, with two things the
 * browser cannot have: rates that were actually fetched from outside, and a
 * record of every quotation it produced. The site calls it when it is there
 * and falls back to its own copy of the arithmetic when it is not, so the
 * two can never disagree about a price — only about where the exchange rate
 * came from.
 *
 * Swagger is the API's specification, generated from the DTOs and the
 * controllers, at /docs. It is also the demo surface.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "warn", "error"] });

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const doc = new DocumentBuilder()
    .setTitle("Quotation API")
    .setDescription(
      "One priced ocean-freight quotation, from real exchange rates and a public port list. " +
        "Every figure carries its source and the time it was fetched.",
    )
    .setVersion("1.0")
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, doc));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`quotation-api listening on http://localhost:${port}  (docs at /docs)`);
}

bootstrap();
