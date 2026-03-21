// utils/get-site-initial-value.ts

import { from } from "@/schemaTypes/templates";
import {
  GlobalCompliance,
  GlobalIntegrations,
  GlobalOrganization,
  GlobalRobots,
  GlobalSeo,
  GlobalStructuredData,
  GlobalTheme,
  Site,
} from "@workspace/sanity/types";
import { SanityClient } from "sanity";
import { WorkspaceKey } from "../constant";

export async function getSiteInitialValue(
  client: SanityClient,
  workspace: WorkspaceKey,
) {
  const globals = await client.fetch<{
    org: GlobalOrganization;
    seo: GlobalSeo;
    theme: GlobalTheme;
    integrations: GlobalIntegrations;
    compliance: GlobalCompliance;
    structuredData: GlobalStructuredData;
    robots: GlobalRobots;
  }>(`{
    "org":            *[_type == "globalOrganization"][0],
    "seo":            *[_type == "globalSeo"][0],
    "compliance":     *[_type == "globalCompliance"][0],
    "theme":          *[_type == "globalTheme"][0],
    "integrations":   *[_type == "globalIntegrations"][0],
    "structuredData": *[_type == "globalstructuredData"][0],
    "robots":         *[_type == "globalRobots"][0],
  }`);

  const {
    org,
    seo,
    theme,
    integrations,
    compliance,
    robots: robotsDoc,
    structuredData: structuredDataDoc,
  } = globals;

  return {
    ...from(
      org,
      ({
        name,
        organizationNumber,
        email,
        phone,
        address,
        linkedin,
        facebook,
        instagram,
        youtube,
        twitter,
        favicon,
        logo,
      }) => ({
        name,
        organizationNumber,
        email,
        phone,
        address,
        linkedin,
        facebook,
        instagram,
        youtube,
        twitter,
        favicon,
        logo,
      }),
    ),
    ...from(
      seo,
      ({
        metaTitle,
        metaDescription,
        googleSiteVerification,
        ogTitle,
        ogDescription,
        ogImage,
      }) => ({
        metaTitle,
        metaDescription,
        googleSiteVerification,
        ogTitle,
        ogDescription,
        ogImage,
      }),
    ),
    ...from(theme, ({ light, dark }) => ({ light, dark })),
    ...from(
      robotsDoc?.robots,
      ({ maxSnippet, maxImagePreview, maxVideoPreview }) => ({
        maxSnippet,
        maxImagePreview,
        maxVideoPreview,
      }),
    ),
    ...from(structuredDataDoc?.structuredData, ({ organization, website }) => ({
      organization,
      website,
    })),
    ...from(
      integrations,
      ({ googleAnalyticsId, gtmContainerId, facebookPixelId }) => ({
        googleAnalyticsId,
        gtmContainerId,
        facebookPixelId,
      }),
    ),
    ...from(
      compliance,
      ({ bannerTitle, bannerDescription, categories, legalDocuments }) => ({
        bannerTitle,
        bannerDescription,
        categories,
        legalDocuments: (legalDocuments ?? []).map(({ _ref, _type }) => ({
          _type,
          _ref,
          _key: crypto.randomUUID().slice(0, 8),
        })),
      }),
    ),
    workspace,
  };
}
