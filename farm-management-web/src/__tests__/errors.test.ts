import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/errors";

function axiosError(response?: { status: number; data?: unknown }) {
  return { isAxiosError: true, response };
}

describe("getErrorMessage", () => {
  it("API'nin dondurdugu message alanini gosterir", () => {
    const err = axiosError({
      status: 409,
      data: { message: "Bu kimlik numarasiyla kayitli bir ciftci zaten var." },
    });
    expect(getErrorMessage(err)).toBe(
      "Bu kimlik numarasiyla kayitli bir ciftci zaten var."
    );
  });

  it("sunucuya ulasilamazsa bilgilendirici mesaj dondurur", () => {
    expect(getErrorMessage(axiosError())).toContain("Sunucuya ulaşılamadı");
  });

  it("401 icin oturum mesaji dondurur", () => {
    expect(getErrorMessage(axiosError({ status: 401 }))).toContain(
      "Oturum süresi dolmuş"
    );
  });

  it("validasyon hatalarini birlestirir", () => {
    const err = axiosError({
      status: 400,
      data: {
        errors: {
          FullName: ["Ad soyad boş bırakılamaz."],
          NationalId: ["Kimlik numarası 11 haneli rakamlardan oluşmalıdır."],
        },
      },
    });
    const message = getErrorMessage(err);
    expect(message).toContain("Ad soyad boş bırakılamaz.");
    expect(message).toContain("11 haneli");
  });
});