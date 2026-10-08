import { apiClient } from "@/shared/api";

import type { CTA, PublicCtaDto } from "./types";

/**
 * Request functions for the `cta` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `cta` feature aware of the
 * endpoint's URL — `useCTA` and any future consumer call `fetchCTA`,
 * never `apiClient` directly.
 *
 * The real endpoint (`GET /public/cta`) 404s when the banner is
 * disabled or not yet published (see the controller's own doc
 * comment) — that surfaces as a normal rejected request, which
 * `useCTA`'s `UseQueryResult` already represents as `isError`/no
 * `data`, so `./CTA.tsx`'s existing "fall back to placeholder copy"
 * behavior needs no extra handling here.
 */
export async function fetchCTA(): Promise<CTA> {
  const response = await apiClient.get<PublicCtaDto>("/cta");
  return toCTA(response.data);
}

function toCTA(dto: PublicCtaDto): CTA {
  return {
    title: dto.title.fa,
    description: dto.description?.fa,
    primaryCta: { label: dto.primaryButtonLabel.fa, href: dto.primaryButtonUrl },
    secondaryCta:
      dto.secondaryButtonLabel && dto.secondaryButtonUrl
        ? { label: dto.secondaryButtonLabel.fa, href: dto.secondaryButtonUrl }
        : undefined,
  };
}
