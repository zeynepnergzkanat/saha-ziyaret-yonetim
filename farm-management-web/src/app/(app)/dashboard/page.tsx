"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  formatDate,
  statusBadgeClasses,
  statusLabels,
  typeLabels,
} from "@/lib/labels";
import type { DashboardSummary } from "@/types";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardSummary>("/api/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(() =>
        setError("Dashboard verileri yüklenemedi. API çalışıyor mu?")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Yükleniyor...</p>;
  }

  if (error || !data) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Veri bulunamadı."}
      </p>
    );
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

      {data.upcomingVisits.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Önümüzdeki 7 gün için planlanmış ziyaret yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Çiftçi</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {data.upcomingVisits.map((visit) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}