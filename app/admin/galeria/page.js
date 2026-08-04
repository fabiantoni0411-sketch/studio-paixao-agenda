"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "galeria";

export default function GaleriaPage() {
  return (
    <AdminGuard>
      <GalleryManager />
    </AdminGuard>
  );
}

function GalleryManager() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("sort_order", { ascending: true });
    setPhotos(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file);

    if (uploadError) {
      setError("Erro ao enviar a foto. Verifique se o bucket 'galeria' existe e é público.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    await supabase.from("gallery_photos").insert({
      url: publicUrlData.publicUrl,
      sort_order: photos.length,
    });

    setUploading(false);
    load();
  }

  async function removePhoto(photo) {
    if (!confirm("Remover esta foto?")) return;
    const path = photo.url.split(`/${BUCKET}/`)[1];
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    await supabase.from("gallery_photos").delete().eq("id", photo.id);
    load();
  }

  return (
    <div>
      <h1 className="font-title text-2xl text-pink-600 font-bold mb-6">Galeria de fotos</h1>

      <label className="btn-primary cursor-pointer inline-block mb-6">
        {uploading ? "Enviando..." : "Enviar nova foto"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
        {photos.map((p) => (
          <div key={p.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="w-full aspect-square object-cover rounded-xl" />
            <button
              onClick={() => removePhoto(p)}
              className="absolute top-2 right-2 bg-white/90 text-red-500 text-xs font-bold px-2 py-1 rounded-full shadow"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
