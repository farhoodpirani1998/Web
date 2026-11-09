import { describe, expect, it } from "vitest";

import { createPreRegistrationCsv } from "./exportCsv";
import type { CmsPreRegistration } from "./types";

const row: CmsPreRegistration = {
  id: "1",
  createdAt: "2026-10-13T10:00:00.000Z",
  updatedAt: "2026-10-13T10:00:00.000Z",
  studentFirstName: "علی",
  studentLastName: 'محمدی "الف"',
  studentNationalId: "1234567891",
  studentBirthDate: "2015-01-01",
  studentGrade: "grade-1",
  guardianFullName: "رضا",
  guardianPhone: "09121234567",
  status: "new",
};

describe("createPreRegistrationCsv", () => {
  it("includes a UTF-8 BOM, escaped values, and Persian grade labels", () => {
    const csv = createPreRegistrationCsv([row]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"محمدی ""الف"""');
    expect(csv).toContain('"پایه اول ابتدایی"');
  });
});
