import type { CmsPreRegistration } from "./types";
import { getPreRegistrationGradeLabel } from "./gradeLabels";

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function createPreRegistrationCsv(rows: CmsPreRegistration[]): string {
  const header = [
    "نام",
    "نام خانوادگی",
    "کد ملی",
    "تاریخ تولد",
    "پایه",
    "نام سرپرست",
    "تلفن",
    "ایمیل",
    "وضعیت",
    "تاریخ ثبت",
  ];
  const lines = rows.map((row) => [
    row.studentFirstName,
    row.studentLastName,
    row.studentNationalId,
    row.studentBirthDate,
    getPreRegistrationGradeLabel(row.studentGrade),
    row.guardianFullName,
    row.guardianPhone,
    row.guardianEmail ?? "",
    row.status,
    row.createdAt,
  ]);
  return `\uFEFF${[header, ...lines].map((line) => line.map(escapeCsv).join(",")).join("\r\n")}`;
}
