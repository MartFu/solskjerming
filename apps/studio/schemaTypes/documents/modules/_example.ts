/**
 * example-modules.ts — apps/studio/schemaTypes/modules/definitions
 *
 * Example module definitions showing how initialBlocks (option B) work
 * in practice. These are illustrative — adapt to your actual module files.
 *
 * The key pattern: BLOCK_SEEDS gives each blueprint a meaningful starting
 * structure so editors open a pre-scaffolded page, not a blank canvas.
 */

import {
    BookOpen,
    GraduationCap,
    Newspaper,
    ShoppingBag,
    ShoppingCart,
} from "lucide-react";
import { defineModule } from "@/utils/modules";
import { BLOCK_SEEDS } from "@/schemaTypes/blocks/v2";

// ── Articles module ───────────────────────────────────────────────────────────

export const articlesModule = defineModule({
    key: "articles",
    title: "Articles",
    globals: {
        author: true, // uncomment when author global is added
    },
    blueprints: {
        // The blog index page — lists all articles
        articleIndex: {
            role: "articleIndex",
            title: "Article index",
            icon: Newspaper,
            isEntryPoint: true,
            description: "A listing page for all articles.",
            initialBlocks: [
                BLOCK_SEEDS.banner,
                BLOCK_SEEDS.feed({
                    sourceType: "article",
                    displayStyle: "magazine",
                    showFilters: true,
                }),
            ],
        },
        // An individual article page — long-form content
        article: {
            role: "article",
            title: "Article",
            icon: BookOpen,
            allowedParentBlueprints: ["articleIndex"],
            description: "A single article or blog post.",
            initialBlocks: [
                // Banner seeds the hero area — editor fills in title + image
                BLOCK_SEEDS.banner,
                // RichText seeds the body — editor writes the article content here
                BLOCK_SEEDS.richText,
                // CTA seeds a closing action — e.g. newsletter subscribe or related reading
                BLOCK_SEEDS.cta,
            ],
        },
    },
});

// ── Commerce module ───────────────────────────────────────────────────────────

export const commerceModule = defineModule({
    key: "commerce",
    title: "Netthandel",
    globals: {
        product: true,
    },
    blueprints: {
        // The catalog / shop index
        catalog: {
            role: "catalog",
            title: "Produktkatalog",
            icon: ShoppingCart,
            isEntryPoint: true,
            description: "Butikk eller produktliste.",
            initialBlocks: [
                BLOCK_SEEDS.intro,
                BLOCK_SEEDS.feed({
                    sourceType: "product",
                    displayStyle: "grid",
                    showFilters: true,
                }),
            ],
        },
        // An individual product detail page
        productPage: {
            role: "productPage",
            title: "Produktside",
            icon: ShoppingBag,
            allowedParentBlueprints: ["catalog", "productPage"],
            description: "En side med produktdetaljer.",
            initialBlocks: [
                // Split seeds the hero — product image on one side, details the other
                BLOCK_SEEDS.split,
                // Accordion seeds the specs/details section
                BLOCK_SEEDS.accordion({ sourceType: "inline" }),
                // Testimonial seeds a social proof section
                BLOCK_SEEDS.testimonial,
                // LogoGrid seeds trust signals — payment methods, certifications
                BLOCK_SEEDS.logoGrid,
                // ReferenceGrid seeds a "related products" section
                BLOCK_SEEDS.referenceGrid,
            ],
        },
    },
});

// ── Learning module ───────────────────────────────────────────────────────────

export const learningModule = defineModule({
    key: "learning",
    title: "Learning",
    globals: {},
    blueprints: {
        // The course catalog
        courseIndex: {
            role: "courseIndex",
            title: "Course catalog",
            icon: GraduationCap,
            isEntryPoint: true,
            description: "Lists all available courses.",
            initialBlocks: [
                BLOCK_SEEDS.banner,
                // Feed with future "course" sourceType — uncomment referenceGrid as fallback now
                BLOCK_SEEDS.referenceGrid,
            ],
        },
        // A course landing page — sells the course
        courseLanding: {
            role: "courseLanding",
            title: "Course landing",
            icon: BookOpen,
            allowedParentBlueprints: ["courseIndex"],
            description: "Marketing page for a single course.",
            initialBlocks: [
                BLOCK_SEEDS.banner,
                BLOCK_SEEDS.stat,
                // Steps seeds the curriculum or learning outcomes
                BLOCK_SEEDS.steps,
                // Accordion seeds the curriculum outline
                BLOCK_SEEDS.accordion({ sourceType: "inline" }),
                BLOCK_SEEDS.testimonial,
                BLOCK_SEEDS.pricing,
                BLOCK_SEEDS.cta,
            ],
        },
        // An individual lesson page
        lesson: {
            role: "lesson",
            title: "Lesson",
            icon: BookOpen,
            allowedParentBlueprints: ["courseLanding"],
            description: "A single lesson within a course.",
            initialBlocks: [
                BLOCK_SEEDS.intro,
                BLOCK_SEEDS.richText,
                // Media seeds a video embed for the lesson
                BLOCK_SEEDS.media,
                BLOCK_SEEDS.cta,
            ],
        },
    },
});
