"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createFarmer, updateFarmer } from "@/store/farmersSlice";
import { unwrapMessage } from "@/lib/errors";
import type { Farmer, FarmerInput } from "@/types";

type FieldErrors = Partial<Record<keyof FarmerInput, string>>;

const fields: {
  name: keyof FarmerInput;
  label: string;
  placeholder: string;
  maxLength?: number;
}[] = [
  { name: "fullName", label: "Ad Soyad", placeholder: "Ahmet Yılmaz", maxLength: 100 },
  { name: "nationalId", label: "Kimlik No", placeholder: "11 haneli kimlik numarası", maxLength: 11 },
  { name: "phoneNumber", label: "Telefon", placeholder: "05XXXXXXXXX", maxLength: 11 },
  { name: "region", label: "Bölge", placeholder: "Ankara" },
  { name: "district", label: "İlçe", placeholder: "Çankaya" },
];

function validate(values: FarmerInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.fullName.trim()) {
    errors.fullName = "Ad soyad boş bırakılamaz.";
  } else if (values.fullName.trim().length > 100) {
    errors.fullName = "Ad soyad en fazla 100 karakter olabilir.";
  }
  if (!/^\d{11}$/.test(values.nationalId)) {
    errors.nationalId = "Kimlik numarası 11 haneli rakamlardan oluşmalıdır.";
  }
  if (!/^(0)?5\d{9}$/.test(values.phoneNumber)) {
    errors.phoneNumber = "Telefon numarası geçerli formatta olmalıdır (ör: 05XXXXXXXXX).";
  }
  if (!values.region.trim()) {
    errors.region = "Bölge boş bırakılamaz.";
  }
  if (!values.district.trim()) {
    errors.district = "İlçe boş bırakılamaz.";
  }
  return errors;
}

interface Props {
  farmer: Farmer | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function FarmerFormModal({ farmer, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<FarmerInput>({
    fullName: farmer?.fullName ?? "",
    nationalId: farmer?.nationalId ?? "",
    phoneNumber: farmer?.phoneNumber ?? "",
    region: farmer?.region ?? "",
    district: farmer?.district ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input: FarmerInput = {
      ...values,
      fullName: values.fullName.trim(),
      region: values.region.trim(),
      district: values.district.trim(),
    };

    setSaving(true);
    try {
      if (farmer) {
        await dispatch(updateFarmer({ id: farmer.id, input })).unwrap();
      } else {
        await dispatch(createFarmer(input)).unwrap();
      }
      onSaved();
    } catch (err) {
      setServerError(unwrapMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold">
          {farmer ? "Çiftçiyi Düzenle" : "Yeni Çiftçi"}
        </h2>

        {fields.map((field) => (
          <div key={field.name} className="mb-3">
            <label className="mb-1 block text-sm font-medium" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              id={field.name}
              value={values[field.name]}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            />
            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}

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