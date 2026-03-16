// import { defineLocations} from "sanity/presentation";
// import type { SiteRegistryConfig } from "@/sanity.config";

// // Create a locations resolver factory that captures workspace config
// export const createLocations = (config: SiteRegistryConfig) => ({
//   homePage: defineLocations({
//     select: {
//       title: "title",
//       siteId: "siteId",
//     },
//     resolve: (doc) => {
//       const site = config.sites.find(s => s.id === doc?.siteId);
//       if (!site) return { locations: [] };
      
//       return {
//         locations: [
//           {
//             title: doc?.title || "Home",
//             href: `/${site.id}`,
//           },
//         ],
//       };
//     },
//   }),
  
//   page: defineLocations({
//     select: {
//       title: "title",
//       slug: "slug.current",
//       siteId: "siteId",
//     },
//     resolve: (doc) => {
//       if (!doc?.slug) return { locations: [] };

//       const site = config.sites.find(s => s.id === doc?.siteId);
//       if (!site) return { locations: [] };
      
//       return {
//         locations: [
//           {
//             title: doc?.title || "Untitled",
//             href: `/${site.id}/${doc.slug}`,
//           },
//         ],
//       };
//     },
//   }),
  
//   articles: defineLocations({
//     select: {
//       title: "title",
//       slug: "slug.current",
//       siteId: "siteId",
//     },
//     resolve: (doc) => {
//       const site = config.sites.find(s => s.id === doc?.siteId);
//       if (!site) return { locations: [] };

//       return {locations: [
//         {
//           title: doc?.title || "Untitled",
//           href: `/${site.id}/artikler/${doc?.slug}`,
//         },
//         {
//           title: "Articles Index",
//           href: `/${site.id}/artikler`,
//         },
//       ],}
//     },
//   }),
  
//   article: defineLocations({
//     select: {
//       title: "title",
//       slug: "slug.current",
//       siteId: "siteId",
//     },
//     resolve: (doc) => {
//         const site = config.sites.find(s => s.id === doc?.siteId);
//       if (!site) return { locations: [] };

//      return { locations: [
//         {
//           title: doc?.title || "Untitled",
//           href: `/${site.id}/artikler/${doc?.slug}`,
//         },
//         {
//           title: "Articles",
//           href: `/${site.id}/artikler`,
//         },
//       ],
//     }}
//   }),
  
//   // productSunScreen: defineLocations({
//   //   select: {
//   //     title: "title",
//   //     slug: "slug.current",
//   //     siteId: "siteId",
//   //     productType: "productType",
//   //   },
//   //   resolve: (doc) => ({
//   //     locations: [
//   //       {
//   //         title: doc?.title || "Untitled",
//   //         href: `${config.previewOrigin}/${doc.siteId}/produkter/${doc?.slug}`,
//   //       },
//   //       {
//   //         title: "All Products",
//   //         href: `${config.previewOrigin}/${doc.siteId}/produkter`,
//   //       },
//   //       {
//   //         title: doc?.productType ? `${doc.productType}s` : "Products",
//   //         href: `${config.previewOrigin}/${doc.siteId}/produkter?type=${doc?.productType}`,
//   //       },
//   //     ],
//   //   }),
//   // }),
  
//   // Fallback for types without specific location logic
//   settings: defineLocations({
//     select: { title: "title" },
//     resolve: () => ({ locations: [] }), // Settings don't have front-end previews
//   }),
// });