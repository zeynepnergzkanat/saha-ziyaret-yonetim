"use client";

import { useEffect, useState } from "react";
import FarmerFormModal from "@/components/FarmerFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteFarmer, fetchFarmers } from "@/store/farmersSlice";
import { unwrapMessage } from "@/lib/errors";
import type { Farmer } from "@/types";

const PAGE_SIZE = 10;

type ModalState = { farmer: Farmer | null } | null;

export default function FarmersPage() {
  const dispatch = useAppDispatch();
  const { items, totalCount, status, error } = useAppSelector(
    (state) => state.farmers
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchFarmers({ page, pageSize: PAGE_SIZE, search }));
  }, [dispatch, page, search]);

  const reload = () => {
    dispatch(fetchFarmers({ page, pageSize: PAGE_SIZE, search }));
  };

  const handleDelete = async (farmer: Farmer) => {
    if (!window.confirm(`"${farmer.fullName}" kaydını silmek istediğinize emin misiniz?`)) {
      return;
    }
    setActionError(null);
    try {
      await dispatch(deleteFarmer(farmer.id)).unwrap();
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      setActionError(unwrapMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Çiftçiler</h1>
        <button
          onClick={() => setModal({ farmer: null })}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Yeni Çiftçi
        </button>
      </div>

      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Ad, bölge veya telefon ile ara..."
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
      />

      {actionError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}
      {status === "failed" && error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">Kimlik No</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Bölge</th>
              <th className="px-4 py-3 font-medium">İlçe</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((farmer) => (
                <tr key={farmer.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{farmer.fullName}</td>
                  <td className="px-4 py-3">{farmer.nationalId}</td>
                  <td className="px-4 py-3">{farmer.phoneNumber}</td>
                  <td className="px-4 py-3">{farmer.region}</td>
                  <td className="px-4 py-3">{farmer.district}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ farmer })}
                      className="mr-3 text-emerald-700 hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(farmer)}
                      className="text-red-600 hover:underline"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Toplam {totalCount} kayıt</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-50"
          >
            Önceki
          </button>
          <span>
            Sayfa {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>

      {modal && (
        <FarmerFormModal
          farmer={modal.farmer}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}
    </div>
  );
}