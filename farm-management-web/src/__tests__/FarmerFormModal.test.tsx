import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import FarmerFormModal from "@/components/FarmerFormModal";
import { makeStore } from "@/store";

function renderModal() {
  return render(
    <Provider store={makeStore()}>
      <FarmerFormModal farmer={null} onClose={vi.fn()} onSaved={vi.fn()} />
    </Provider>
  );
}

describe("FarmerFormModal", () => {
  it("bos form gonderilince validasyon mesajlarini gosterir", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(await screen.findByText("Ad soyad boş bırakılamaz.")).toBeDefined();
    expect(
      screen.getByText("Kimlik numarası 11 haneli rakamlardan oluşmalıdır.")
    ).toBeDefined();
    expect(screen.getByText("Bölge boş bırakılamaz.")).toBeDefined();
  });

  it("gecersiz telefon icin hata mesaji gosterir", async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText("Telefon"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(
      await screen.findByText(/Telefon numarası geçerli formatta olmalıdır/)
    ).toBeDefined();
  });
});