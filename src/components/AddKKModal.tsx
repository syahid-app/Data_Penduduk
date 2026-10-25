'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { Family, PeneranganType, MckType, BansosType } from '@/lib/types';
import { PlusCircle, X, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface AddKKModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFamily?: Family | null;
}

export const AddKKModal: React.FC<AddKKModalProps> = ({
  isOpen,
  onClose,
  editFamily,
}) => {
  const { addFamily, updateFamily } = useApp();

  const [noKK, setNoKK] = useState(editFamily?.no_kk || '');
  const [kepalaKeluarga, setKepalaKeluarga] = useState(editFamily?.kepala_keluarga || '');
  const [alamat, setAlamat] = useState(editFamily?.alamat || '');
  const [noRumah, setNoRumah] = useState(editFamily?.no_rumah || '');
  const [dusun, setDusun] = useState(editFamily?.dusun || 'Dusun I');
  const [rw, setRw] = useState(editFamily?.rw || '001');
  const [rt, setRt] = useState(editFamily?.rt || '001');
  const [statusBarcode, setStatusBarcode] = useState(editFamily ? editFamily.status_barcode : true);
  const [statusUpdate, setStatusUpdate] = useState(editFamily ? editFamily.status_update : true);
  const [penerangan, setPenerangan] = useState<PeneranganType>(editFamily?.penerangan || 'meteran');
  const [fasilitasMck, setFasilitasMck] = useState<MckType>(editFamily?.fasilitas_mck || 'sendiri');
  const [bantuanSosial, setBantuanSosial] = useState<BansosType>(editFamily?.bantuan_sosial || 'none');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noKK || noKK.length !== 16) {
      setError('Nomor KK harus tepat 16 digit angka.');
      return;
    }
    if (!kepalaKeluarga.trim()) {
      setError('Nama Kepala Keluarga wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    if (editFamily) {
      const res = await updateFamily(editFamily.id, {
        no_kk: noKK,
        kepala_keluarga: kepalaKeluarga.toUpperCase(),
        alamat,
        no_rumah: noRumah || (alamat.match(/No\.?\s*(\d+)/i)?.[1] || '01'),
        dusun,
        rw,
        rt,
        status_barcode: statusBarcode,
        status_update: statusUpdate,
        penerangan,
        fasilitas_mck: fasilitasMck,
        bantuan_sosial: bantuanSosial,
      });

      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Gagal mengubah data KK');
      }
    } else {
      const res = await addFamily({
        no_kk: noKK,
        kepala_keluarga: kepalaKeluarga.toUpperCase(),
        alamat,
        no_rumah: noRumah || (alamat.match(/No\.?\s*(\d+)/i)?.[1] || '01'),
        dusun,
        rw,
        rt,
        status_barcode: statusBarcode,
        status_update: statusUpdate,
        penerangan,
        fasilitas_mck: fasilitasMck,
        bantuan_sosial: bantuanSosial,
      });

      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Gagal menambahkan KK baru');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {editFamily ? 'Edit Kartu Keluarga' : 'Tambah Kartu Keluarga Baru'}
              </h3>
              <p className="text-xs text-slate-500">Khusus Otoritas Admin Desa Karanghaur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Kartu Keluarga (16 Digit)
            </label>
            <input
              type="text"
              maxLength={16}
              value={noKK}
              onChange={(e) => setNoKK(e.target.value.replace(/\D/g, ''))}
              placeholder="3216081203000..."
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Kepala Keluarga
            </label>
            <input
              type="text"
              value={kepalaKeluarga}
              onChange={(e) => setKepalaKeluarga(e.target.value)}
              placeholder="SAMSUDIN"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dusun</label>
              <select
                value={dusun}
                onChange={(e) => setDusun(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="Dusun I">Dusun I</option>
                <option value="Dusun II">Dusun II</option>
                <option value="Dusun III">Dusun III</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RW</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="001">001</option>
                <option value="002">002</option>
                <option value="003">003</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RT</label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="001">001</option>
                <option value="002">002</option>
                <option value="003">003</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap / Jalan
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Lapangan Desa"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Rumah
              </label>
              <input
                type="text"
                value={noRumah}
                onChange={(e) => setNoRumah(e.target.value)}
                placeholder="12"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bantuan Sosial</label>
              <select
                value={bantuanSosial}
                onChange={(e) => setBantuanSosial(e.target.value as BansosType)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="none">Non-Bansos</option>
                <option value="pkh">PKH</option>
                <option value="bpnt">BPNT</option>
                <option value="blt">BLT</option>
                <option value="kip">KIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Penerangan PLN</label>
              <select
                value={penerangan}
                onChange={(e) => setPenerangan(e.target.value as PeneranganType)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="meteran">Meteran Sendiri</option>
                <option value="tetangga">Sambung Tetangga</option>
                <option value="tanpa_meteran">Tanpa Meteran</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fasilitas MCK</label>
              <select
                value={fasilitasMck}
                onChange={(e) => setFasilitasMck(e.target.value as MckType)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="sendiri">Sendiri</option>
                <option value="kelompok">Kelompok / Bersama</option>
                <option value="umum">Umum</option>
                <option value="tidak_ada">Tidak Ada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Barcode</label>
              <select
                value={statusBarcode ? 'true' : 'false'}
                onChange={(e) => setStatusBarcode(e.target.value === 'true')}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="true">Sudah Barcode (Dukcapil)</option>
                <option value="false">Belum Barcode (Manual)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : editFamily ? 'Simpan Perubahan' : 'Tambah KK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
