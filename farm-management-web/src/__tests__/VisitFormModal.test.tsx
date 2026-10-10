import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import VisitFormModal from "@/components/VisitFormModal";
import { makeStore } from "@/store";
import type { Farmer } from "@/types";

const farmers: Farmer[] = [
  {
    id: 1,
    fullName: "Test Ciftci",
    nationalId: "11122233344",
    phoneNumber: "05321234567",
    region: "Test Bolge",
    district: "Test Ilce",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

function renderModal() {
  return render(
    <Provider store={makeStore()}>
      <VisitFormModal
        visit={null}
        farmers={farmers}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    </Provider>
  );
}

describe("VisitFormModal", () => {
  it("gecmis tarihli planli ziyareti reddeder", async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText("Ziyaret tarihi"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(
      await screen.findByText("Geçmiş bir tarih için planlı ziyaret oluşturulamaz.")
    ).toBeDefined();
  });

  it("tamamlanan ziyarette not zorunludur", async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText("Durum"), {
      target: { value: "Completed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(
      await screen.findByText("Tamamlanan ziyaretler için not alanı zorunludur.")
    ).toBeDefined();
  });
});