import axios from "axios";

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Sunucuya ulaşılamadı. API çalışıyor mu?";
    }
    const { status, data } = err.response;
    if (status === 401) {
      return "Oturum süresi dolmuş olabilir. Çıkış yapıp tekrar giriş yapın.";
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors as Record<string, string[]>).flat();
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
    return `İşlem başarısız (hata kodu: ${status}).`;
  }
  return "Beklenmeyen bir hata oluştu.";
}

export function unwrapMessage(err: unknown): string {
  return typeof err === "string" ? err : "Beklenmeyen bir hata oluştu.";
}