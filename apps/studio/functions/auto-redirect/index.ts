import { createClient } from "@sanity/client";
import { documentEventHandler } from "@sanity/functions";
import { Logger } from "@workspace/logger";

import { API_VERSION } from '@/utils/env';
import { DOCUMENTS } from "@/schemaTypes/constant";

const logger = new Logger("AutoRedirect");

export const handler = documentEventHandler(async ({ context, event }) => {
  const client = createClient({
    ...context.clientOptions,
    useCdn: false,
    apiVersion: API_VERSION,
  });

  const { beforeSlug, slug } = event.data;

  if (!(slug && beforeSlug)) {
    logger.info("Ingen slug eller før-slug oppgitt");
    return;
  }
  if (slug === beforeSlug) {
    logger.info("Sluggen ble ikke oppdatert");
    return;
  }
  // check if redirect already exists
  const existingRedirect = await client.fetch(
    `*[_type == ${DOCUMENTS.redirect} && source.current == $beforeSlug][0]`,
    { beforeSlug }
  );
  if (existingRedirect) {
    logger.info(`Redirigering eksisterer allerede for kilde ${beforeSlug}`);
    return;
  }
  // check for loops
  const loopRedirect = await client.fetch(
    `*[_type == ${DOCUMENTS.redirect} && source.current == $slug && destination.current == $beforeSlug][0]`,
    { slug, beforeSlug }
  );
  if (loopRedirect) {
    logger.warning("Rediringeringsløkke oppdaget");
    return;
  }
  const redirect = {
      _type: DOCUMENTS.redirect,
      status: "active",
      source: {
          current: beforeSlug,
      },
      destination: {
          current: slug,
      },
      permanent: "true",
  };

  try {
    const res = await client.create(redirect);
    logger.info(
      `Redirirering ${beforeSlug} til ${slug} ble opprettet`,
      JSON.stringify(res)
    );
  } catch (error) {
    logger.error("Kunne ikke opprette redirigering", error);
  }
});
