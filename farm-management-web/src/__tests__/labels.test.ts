import { describe, expect, it } from "vitest";
import { formatDate, statusLabels, typeLabels } from "@/lib/labels";

describe("labels", () => {
  it("tarih bos ise tire dondurur", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("tarihi gun.ay.yil bicimine cevirir", () => {
    expect(formatDate("2026-10-15T00:00:00")).toBe("15.10.2026");
  });

  it("durum ve tur etiketlerini Turkce gosterir", () => {
    expect(statusLabels.Completed).toBe("Tamamlandı");
    expect(typeLabels.Emergency).toBe("Acil");
  });
});