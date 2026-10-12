"use client";

import { useEffect, useState } from "react";
import VisitFormModal from "@/components/VisitFormModal";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
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

  const columns: Column<FarmVisit>[] = [
    { header: "Çiftçi", cell: (visit) => visit.farmerName ?? "-" },
    { header: "Tarih", cell: (visit) => formatDate(visit.visitDate) },
    { header: "Tür", cell: (visit) => typeLabels[visit.visitType] },
    {
      header: "Durum",
      cell: (visit) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClasses[visit.status]}`}
        >
          {statusLabels[visit.status]}
        </span>
      ),
    },
    { header: "Sonraki ziyaret", cell: (visit) => formatDate(visit.nextVisitDate) },
    {
      header: "Not",
      cell: (visit) => (
        <span className="block max-w-[200px] truncate" title={visit.notes ?? ""}>
          {visit.notes ?? "-"}
        </span>
      ),
    },
    {
      header: "İşlemler",
      align: "right",
      cell: (visit) => (
        <>
          <Button variant="link" className="mr-3" onClick={() => setModal({ visit })}>
            Düzenle
          </Button>
          <Button variant="dangerLink" onClick={() => handleDelete(visit)}>
            Sil
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Ziyaretler</h1>
        <Button onClick={() => setModal({ visit: null })}>Yeni Ziyaret</Button>
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
          <Button
            variant="secondary"
            onClick={() => {
              setFilters(emptyFilters);
              setPage(1);
            }}
          >
            Filtreleri temizle
          </Button>
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

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(visit) => visit.id}
        loading={status === "loading"}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

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