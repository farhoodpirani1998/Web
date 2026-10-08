/**
 * Public surface of the `admissions` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 */
export { Hero } from "./Hero";
export { AdmissionSteps } from "./AdmissionSteps";
export { Requirements } from "./Requirements";
export { RequiredDocuments } from "./RequiredDocuments";
export { TuitionOverview } from "./TuitionOverview";
export { FAQ } from "./FAQ";
export { CTA } from "./CTA";
export type { AdmissionStep, Requirement, RequiredDocument, TuitionPlan } from "./types";
export { admissionSteps, requirements, requiredDocuments, tuitionPlans } from "./data";
