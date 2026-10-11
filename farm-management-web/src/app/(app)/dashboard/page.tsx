"use client";

import { useEffect } from "react";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { fetchDashboard } from "@/store/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  formatDate,
  statusBadgeClasses,
  statusLabels,
  typeLabels,
} from "@/lib/labels";
import type { FarmVisit } from "@/types";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

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
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === "failed" && !data) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Veri bulunamadı."}
      </p>
    );
  }

  if (!data) {
    return <p className="text-slate-500">Yükleniyor...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Toplam çiftçi" value={data.totalFarmers} />
        <StatCard label="Toplam ziyaret" value={data.totalVisits} />
        <StatCard label="Planlanan ziyaret" value={data.plannedVisits} />
        <StatCard label="Tamamlanan ziyaret" value={data.completedVisits} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">
        Önümüzdeki 7 gündeki ziyaretler
      </h2>

      <DataTable
        columns={columns}
        rows={data.upcomingVisits}
        rowKey={(visit) => visit.id}
        emptyMessage="Önümüzdeki 7 gün için planlanmış ziyaret yok."
      />
    </div>
  );
}