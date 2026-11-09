import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { parseAboutBody, renderAboutInline } from "./markdown";

describe("About body formatting", () => {
  it("parses supported headings and keeps paragraphs in order", () => {
    expect(
      parseAboutBody("# معرفی\n\nمتن نخست.\n\n## امکانات\n\n### کلاس هوشمند"),
    ).toEqual([
      { type: "heading", level: 1, text: "معرفی" },
      { type: "paragraph", text: "متن نخست." },
      { type: "heading", level: 2, text: "امکانات" },
      { type: "heading", level: 3, text: "کلاس هوشمند" },
    ]);
  });

  it("renders bold text without interpreting other input as markup", () => {
    const { container } = render(<p>{renderAboutInline("متن **مهم** # عادی")}</p>);

    expect(screen.getByText("مهم").tagName).toBe("STRONG");
    expect(container.querySelector("p")?.textContent).toBe("متن مهم # عادی");
  });
});
