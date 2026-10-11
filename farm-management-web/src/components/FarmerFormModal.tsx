"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
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
    <Modal title={farmer ? "Çiftçiyi Düzenle" : "Yeni Çiftçi"}>
      <form onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <Input
            key={field.name}
            id={field.name}
            label={field.label}
            value={values[field.name]}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            error={errors[field.name]}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
            }
          />
        ))}

        {serverError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}