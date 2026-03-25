import { PhoneCall, FormInput, CreditCard, Square } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { buttonsField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

// ── CTA ───────────────────────────────────────────────────────────────────────

/**
 * CTA — updated from existing cta.ts.
 * Adds: layout option for inline vs section-level treatment.
 * Keeps: eyebrow, title, body, buttons — same field names, backward compatible.
 */
export const cta = defineType({
    name: "cta",
    title: "CTA",
    type: "object",
    icon: PhoneCall,
    description: "A call to action — heading, body, and one or two buttons.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description: "Small label above the heading.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "The primary call to action heading.",
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        buttonsField,
        defineField({
            name: "layout",
            title: "Layout",
            type: "string",
            description: "How the CTA is displayed on the page.",
            options: {
                list: [
                    { title: "Centered — full section", value: "centered" },
                    {
                        title: "Split — text left, buttons right",
                        value: "split",
                    },
                    {
                        title: "Inline — compact, within content",
                        value: "inline",
                    },
                ],
                layout: "radio",
            },
            initialValue: "centered",
        }),
    ],
    preview: {
        select: { title: "title" },
        prepare: ({ title }) => ({
            title: title ?? "CTA",
            subtitle: "CTA",
        }),
    },
});

// ── Pricing ──────────────────────────────────────────────────────────────────────

export const pricing = defineType({
    name: "pricing",
    title: "Priser og Modeller",
    type: "object",
    icon: CreditCard,
    description:
        "Viser priseksempler for spesiallagde produkter og konfigurasjoner.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Overoverskrift (Eyebrow)",
            type: "string",
            description: "Liten etikett over hovedoverskriften.",
        }),
        defineField({
            name: "title",
            title: "Overskrift",
            type: "string",
            description: "Hovedoverskrift for prisseksjonen.",
        }),
        defineField({
            name: "body",
            title: "Beskrivelse",
            type: "array",
            of: [{ type: "block" }],
            description:
                "Forklar kort hvordan prissettingen fungerer for tilpassede produkter.",
        }),
        defineField({
            name: "models",
            title: "Produktmodeller / Eksempler",
            type: "array",
            description: "Ulike utgangspunkter eller populære konfigurasjoner.",
            of: [
                defineArrayMember({
                    name: "model",
                    title: "Modell",
                    type: "object",
                    fields: [
                        defineField({
                            name: "name",
                            title: "Navn på modell",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "startingPrice",
                            title: "Startpris",
                            type: "string",
                            description: "f.eks. 'Fra kr 4 900,-'",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "leadTime",
                            title: "Estemert leveringstid",
                            type: "string",
                            description: "f.eks. '2-4 uker'",
                        }),
                        defineField({
                            name: "description",
                            title: "Kort beskrivelse",
                            type: "text",
                            rows: 2,
                        }),
                        defineField({
                            name: "options",
                            title: "Valgmuligheter",
                            type: "array",
                            description:
                                "Hva kan brukeren konfigurere? (f.eks. Materiale, Farge, Størrelse)",
                            of: [{ type: "string" }],
                        }),
                        defineField({
                            name: "ctaLabel",
                            title: "Knappetekst",
                            type: "string",
                            initialValue: "Start konfigurasjon",
                        }),
                        defineField({
                            name: "ctaUrl",
                            title: "Lenke til konfigurator",
                            type: "url", // Eller 'customUrl' hvis du har den typen
                        }),
                    ],
                    preview: {
                        select: {
                            title: "name",
                            price: "startingPrice",
                        },
                        prepare: ({ title, price }) => ({
                            title: `${title} (${price})`,
                        }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1),
        }),
    ],
    preview: {
        select: { title: "title", models: "models" },
        prepare: ({ title, models = [] }) => ({
            title: title ?? "Prisoversikt",
            subtitle: `${models.length} modell${models.length === 1 ? "" : "er"}`,
        }),
    },
});




// ── Form ──────────────────────────────────────────────────────────────────────

export const form = defineType({
    name: "form",
    title: "Form",
    type: "object",
    icon: FormInput,
    description: "A contact, subscribe, or lead capture form.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description: "Small label above the heading.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "The form heading.",
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        defineField({
            name: "formType",
            title: "Form type",
            type: "string",
            description:
                "The kind of form to show. Controls which fields are displayed.",
            options: {
                list: [
                    { title: "Newsletter subscribe", value: "newsletter" },
                    { title: "Contact", value: "contact" },
                    { title: "Lead capture", value: "lead" },
                ],
                layout: "radio",
            },
            initialValue: "newsletter",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "submitLabel",
            title: "Submit button label",
            type: "string",
            description: "The text on the submit button.",
            initialValue: "Subscribe",
        }),
        defineField({
            name: "successMessage",
            title: "Success message",
            type: "string",
            description: "Shown to the user after they submit the form.",
            initialValue: "Thanks — you're in.",
        }),
        defineField({
            name: "destination",
            title: "Submission destination",
            type: "string",
            description:
                "Integration key or endpoint identifier. Set up in integrations settings.",
        }),
    ],
    preview: {
        select: { title: "title", formType: "formType" },
        prepare: ({ title, formType }) => ({
            title: title ?? "Form",
            subtitle: `Form · ${formType ?? "newsletter"}`,
        }),
    },
});

