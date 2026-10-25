import { apiClient } from "@/shared/api";

import type {
  AdmissionStep,
  Requirement,
  RequiredDocument,
  TuitionPlan,
  PublicAdmissionEntryDto,
} from "./types";

/**
 * Request functions for the `admissions` feature's Public API endpoint
 * (`GET /public/admissions`).
 *
 * Only this file is aware of the endpoint's URL. The backend stores
 * every section's rows in one table with a `kind` discriminator, so
 * `fetchAdmissions` groups the flat response into the four lists each
 * section component renders — the shape `./data`'s literals already had.
 */

export interface Admissions {
  steps: readonly AdmissionStep[];
  requirements: readonly Requirement[];
  requiredDocuments: readonly RequiredDocument[];
  tuitionPlans: readonly TuitionPlan[];
}

export async function fetchAdmissions(): Promise<Admissions> {
  const response = await apiClient.get<PublicAdmissionEntryDto[]>("/admissions");
  const entries = response.data;

  const byKind = (kind: string) => entries.filter((entry) => entry.kind === kind);

  return {
    steps: byKind("step").map((entry) => ({
      id: entry.id,
      order: entry.value ?? "",
      title: entry.title.fa,
      description: entry.description?.fa ?? "",
    })),
    requirements: byKind("requirement").map((entry) => ({
      id: entry.id,
      title: entry.title.fa,
      description: entry.description?.fa ?? "",
    })),
    requiredDocuments: byKind("required_document").map((entry) => ({
      id: entry.id,
      title: entry.title.fa,
      description: entry.description?.fa ?? "",
    })),
    tuitionPlans: byKind("tuition_plan").map((entry) => ({
      id: entry.id,
      title: entry.title.fa,
      price: entry.price ?? "",
      period: entry.period ?? "",
      includes: entry.includes ?? [],
    })),
  };
}
