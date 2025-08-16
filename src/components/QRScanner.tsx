// src/components/QRScanner.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat, IScannerControls } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

type Props = {
  onDecoded: (text: string) => void;
};

export default function QRScanner({ onDecoded }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string>("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    const reader = new BrowserMultiFormatReader(hints);

    async function start() {
      setError("");
      try {
        // 优先后置摄像头
        // const constraints: MediaStreamConstraints = { video: { facingMode: { ideal: "environment" } }, audio: false };
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (result?.getText()) {
              onDecoded(result.getText());
              // 保持预览不断，可根据需要自动停止：controls.stop();
            }
            if (err && !(err instanceof Error)) {
              setError("无法解析二维码");
            } else if (err) {
              setError(err.message || "二维码解析失败");
            }
          }
        );
        setActive(true);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message || "无法启动摄像头");
        } else {
          setError("无法启动摄像头");
        }
      }
    }

    start();

    return () => {
      controlsRef.current?.stop();
      setActive(false);
    };
  }, [onDecoded]);

  async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      // 使用同一 reader 解析图片
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      const reader = new BrowserMultiFormatReader(hints);
      const result = await reader.decodeFromImageUrl(url);
      onDecoded(result.getText());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "图片解析失败");
      } else {
        setError("图片解析失败");
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl shadow">
        <video
          ref={videoRef}
          className={`w-full aspect-[3/4] bg-black ${active ? "opacity-100" : "opacity-80"}`}
          playsInline
          muted
          autoPlay
        />
        <div className="pointer-events-none absolute inset-0 ring-2 ring-white/50 rounded-2xl"></div>
      </div>

      <div className="flex items-center gap-3">
        <label className="px-3 py-2 rounded-xl shadow cursor-pointer border text-sm">从相册识别
          <input type="file" accept="image/*" className="hidden" onChange={handlePickFile} />
        </label>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
}