"use client";

import { useEffect, useState } from "react";
import VisitFormModal from "@/components/VisitFormModal";
import api from "@/lib/api";
import { unwrapMessage } from "@/lib/errors";
import {
  formatDate,
  statusBadgeClasses,
  statusLabels,
  typeLabels,
} from "@/lib/labels";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteVisit, fetchVisits } from "@/store/visitsSlice";
import type { VisitFilters } from "@/store/visitsSlice";
import type { FarmVisit, Farmer, PagedResult, VisitStatus } from "@/types";

const PAGE_SIZE = 10;

const emptyFilters: VisitFilters = {
  status: "",
  farmerId: "",
  startDate: "",
  endDate: "",
};

type ModalState = { visit: FarmVisit | null } | null;

const filterClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";

export default function VisitsPage() {
  const dispatch = useAppDispatch();
  const { items, totalCount, status, error } = useAppSelector(
    (state) => state.visits
  );

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VisitFilters>(emptyFilters);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    api
      .get<PagedResult<Farmer>>("/api/farmers", {
        params: { page: 1, pageSize: 1000 },
      })
      .then((res) => setFarmers(res.data.items))
      .catch(() => setFarmers([]));
  }, []);

  useEffect(() => {
    dispatch(fetchVisits({ page, pageSize: PAGE_SIZE, filters }));
  }, [dispatch, page, filters]);

  const reload = () => {
    dispatch(fetchVisits({ page, pageSize: PAGE_SIZE, filters }));
  };

  const updateFilter = <K extends keyof VisitFilters>(
    key: K,
    value: VisitFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDelete = async (visit: FarmVisit) => {
    const label = `${visit.farmerName ?? "Çiftçi"} - ${formatDate(visit.visitDate)}`;
    if (!window.confirm(`"${label}" ziyaretini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setActionError(null);
    try {
      await dispatch(deleteVisit(visit.id)).unwrap();
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      setActionError(unwrapMessage(err));
    }
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Ziyaretler</h1>
        <button
          onClick={() => setModal({ visit: null })}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Yeni Ziyaret
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="f-status">
            Durum
          </label>
          <select
            id="f-status"
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value as VisitStatus | "")}
            className={filterClass}
          >
            <option value="">Tümü</option>
            {(Object.keys(statusLabels) as VisitStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="f-farmer">
            Çiftçi
          </label>
          <select
            id="f-farmer"
            value={filters.farmerId}
            onChange={(e) => updateFilter("farmerId", e.target.value)}
            className={filterClass}
          >
            <option value="">Tümü</option>
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="f-start">
            Başlangıç tarihi
          </label>
          <input
            id="f-start"
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter("startDate", e.target.value)}
            className={filterClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500" htmlFor="f-end">
            Bitiş tarihi
          </label>
          <input
            id="f-end"
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter("endDate", e.target.value)}
            className={filterClass}
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setFilters(emptyFilters);
              setPage(1);
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

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
              <th className="px-4 py-3 font-medium">Çiftçi</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Tür</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Sonraki ziyaret</th>
              <th className="px-4 py-3 font-medium">Not</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              items.map((visit) => (
                <tr key={visit.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{visit.farmerName ?? "-"}</td>
                  <td className="px-4 py-3">{formatDate(visit.visitDate)}</td>
                  <td className="px-4 py-3">{typeLabels[visit.visitType]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClasses[visit.status]}`}
                    >
                      {statusLabels[visit.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(visit.nextVisitDate)}</td>
                  <td className="max-w-[200px] truncate px-4 py-3" title={visit.notes ?? ""}>
                    {visit.notes ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ visit })}
                      className="mr-3 text-emerald-700 hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(visit)}
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
        <VisitFormModal
          visit={modal.visit}
          farmers={farmers}
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