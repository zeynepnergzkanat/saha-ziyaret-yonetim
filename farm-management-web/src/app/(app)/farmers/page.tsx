"use client";

import { useEffect, useState } from "react";
import FarmerFormModal from "@/components/FarmerFormModal";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { controlClass } from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
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

  const columns: Column<Farmer>[] = [
    { header: "Ad Soyad", cell: (farmer) => farmer.fullName },
    { header: "Kimlik No", cell: (farmer) => farmer.nationalId },
    { header: "Telefon", cell: (farmer) => farmer.phoneNumber },
    { header: "Bölge", cell: (farmer) => farmer.region },
    { header: "İlçe", cell: (farmer) => farmer.district },
    {
      header: "İşlemler",
      align: "right",
      cell: (farmer) => (
        <>
          <Button
            variant="link"
            className="mr-3"
            onClick={() => setModal({ farmer })}
          >
            Düzenle
          </Button>
          <Button variant="dangerLink" onClick={() => handleDelete(farmer)}>
            Sil
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Çiftçiler</h1>
        <Button onClick={() => setModal({ farmer: null })}>Yeni Çiftçi</Button>
      </div>

      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Ad, bölge veya telefon ile ara..."
        className={`${controlClass} mb-4 max-w-sm bg-white`}
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

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(farmer) => farmer.id}
        loading={status === "loading"}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

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