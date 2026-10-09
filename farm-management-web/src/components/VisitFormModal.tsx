"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createVisit, updateVisit } from "@/store/visitsSlice";
import { unwrapMessage } from "@/lib/errors";
import { statusLabels, typeLabels } from "@/lib/labels";
import type { FarmVisit, Farmer, VisitStatus, VisitType } from "@/types";

interface FormValues {
  farmerId: string;
  visitDate: string;
  visitType: VisitType;
  status: VisitStatus;
  notes: string;
  nextVisitDate: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

function todayString(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function validate(values: FormValues, original: FarmVisit | null): FieldErrors {
  const errors: FieldErrors = {};

  if (!original && !values.farmerId) {
    errors.farmerId = "Çiftçi seçilmelidir.";
  }
  if (!values.visitDate) {
    errors.visitDate = "Ziyaret tarihi boş bırakılamaz.";
  } else if (values.status === "Planned" && values.visitDate < todayString()) {
    errors.visitDate = "Geçmiş bir tarih için planlı ziyaret oluşturulamaz.";
  }
  if (values.status === "Completed" && !values.notes.trim()) {
    errors.notes = "Tamamlanan ziyaretler için not alanı zorunludur.";
  }
  if (
    values.nextVisitDate &&
    values.visitDate &&
    values.nextVisitDate < values.visitDate
  ) {
    errors.nextVisitDate = "Sonraki ziyaret tarihi, ziyaret tarihinden önce olamaz.";
  }
  if (original?.status === "Completed" && values.status === "Planned") {
    errors.status = "Tamamlanan bir ziyaret tekrar planlı duruma alınamaz.";
  }
  return errors;
}

interface Props {
  visit: FarmVisit | null;
  farmers: Farmer[];
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600";

export default function VisitFormModal({ visit, farmers, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<FormValues>({
    farmerId: visit ? String(visit.farmerId) : "",
    visitDate: visit ? visit.visitDate.slice(0, 10) : "",
    visitType: visit?.visitType ?? "Routine",
    status: visit?.status ?? "Planned",
    notes: visit?.notes ?? "",
    nextVisitDate: visit?.nextVisitDate ? visit.nextVisitDate.slice(0, 10) : "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const statusOptions = (Object.keys(statusLabels) as VisitStatus[]).filter(
    (s) => !(visit?.status === "Completed" && s === "Planned")
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found = validate(values, visit);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      visitDate: values.visitDate,
      visitType: values.visitType,
      status: values.status,
      notes: values.notes.trim() || null,
      nextVisitDate: values.nextVisitDate || null,
    };

    setSaving(true);
    try {
      if (visit) {
        await dispatch(updateVisit({ id: visit.id, input: payload })).unwrap();
      } else {
        await dispatch(
          createVisit({ ...payload, farmerId: Number(values.farmerId) })
        ).unwrap();
      }
      onSaved();
    } catch (err) {
      setServerError(unwrapMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {visit ? "Ziyareti Düzenle" : "Yeni Ziyaret"}
        </h2>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium" htmlFor="farmerId">
            Çiftçi
          </label>
          <select
            id="farmerId"
            value={values.farmerId}
            disabled={!!visit}
            onChange={(e) => set("farmerId", e.target.value)}
            className={`${inputClass} disabled:bg-slate-100`}
          >
            <option value="">Çiftçi seçin</option>
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.fullName}
              </option>
            ))}
          </select>
          {errors.farmerId && (
            <p className="mt-1 text-xs text-red-600">{errors.farmerId}</p>
          )}
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium" htmlFor="visitDate">
            Ziyaret tarihi
          </label>
          <input
            id="visitDate"
            type="date"
            value={values.visitDate}
            onChange={(e) => set("visitDate", e.target.value)}
            className={inputClass}
          />
          {errors.visitDate && (
            <p className="mt-1 text-xs text-red-600">{errors.visitDate}</p>
          )}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="visitType">
              Tür
            </label>
            <select
              id="visitType"
              value={values.visitType}
              onChange={(e) => set("visitType", e.target.value as VisitType)}
              className={inputClass}
            >
              {(Object.keys(typeLabels) as VisitType[]).map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="status">
              Durum
            </label>
            <select
              id="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as VisitStatus)}
              className={inputClass}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.status && (
          <p className="mb-3 text-xs text-red-600">{errors.status}</p>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium" htmlFor="notes">
            Not
          </label>
          <textarea
            id="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputClass}
          />
          {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium" htmlFor="nextVisitDate">
            Sonraki ziyaret tarihi (isteğe bağlı)
          </label>
          <input
            id="nextVisitDate"
            type="date"
            value={values.nextVisitDate}
            onChange={(e) => set("nextVisitDate", e.target.value)}
            className={inputClass}
          />
          {errors.nextVisitDate && (
            <p className="mt-1 text-xs text-red-600">{errors.nextVisitDate}</p>
          )}
        </div>

        {serverError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}