"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error) setPhotos(data || []);
    }
    load();
  }, []);

  if (photos.length === 0) return null;

  return (
    <div id="galeria" className="max-w-4xl mx-auto px-6">
      <h2 className="font-title text-3xl text-pink-600 font-bold text-center mb-6">
        Trabalhos feitos com carinho
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="aspect-square rounded-2xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.caption || "Trabalho do Studio Paixão"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
