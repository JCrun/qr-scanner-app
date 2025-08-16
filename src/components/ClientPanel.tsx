"use client";

import QRScanner from "@/components/QRScanner";
import { parseQr } from "@/lib/parseQr";
import { useEffect, useMemo, useState } from "react";

export default function ClientPanel() {
  const [raw, setRaw] = useState<string>("");

  useEffect(() => {
    const handler = (e: Event) => setRaw((e as CustomEvent<string>).detail);
    window.addEventListener("qr-decoded", handler);
    return () => window.removeEventListener("qr-decoded", handler);
  }, []);

  const rec = useMemo(() => (raw ? parseQr(raw) : null), [raw]);

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => { });
  }
  const onDecoded = (text: string) => {
    const event = new CustomEvent("qr-decoded", { detail: text });
    window.dispatchEvent(event);
  };

  return (
    <section className="space-y-3">
      <h2>二维码扫描</h2>
      <QRScanner onDecoded={onDecoded} />
      <div className="flex gap-2 items-center">
        <textarea
          className="w-full h-20 p-2 border rounded-lg text-sm"
          placeholder="可在此粘贴/查看识别结果原文"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <button className="px-3 py-2 rounded-lg border text-sm" onClick={() => copy(raw)}>复制</button>
      </div>

      {rec && (
        <div id="result-area" className="rounded-2xl shadow border">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium">解析结果</div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => copy(JSON.stringify(rec, null, 2))}>复制JSON</button>
              <button className="px-2 py-1 border rounded" onClick={() => copy(toCSV(rec))}>复制CSV</button>
            </div>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(rec).filter(([k]) => k !== "原文").map(([k, v]) => (
              <div key={k} className="flex flex-col p-2 rounded-lg bg-gray-50">
                <span className="text-gray-500">{k}</span>
                <span className="break-all">{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function toCSV(obj: Record<string, string | undefined>) {
  const keys = Object.keys(obj).filter((k) => k !== "原文");
  const header = keys.join(",");
  const row = keys.map((k) => (obj[k] ?? "").toString().replaceAll(",", " ")).join(",");
  return `${header}\n${row}`;
}