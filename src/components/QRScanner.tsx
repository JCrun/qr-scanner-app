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
    const [isScannerRunning, setIsScannerRunning] = useState(false);

    const startScanning = async () => {
        setError("");
        const hints = new Map();
        // 增加更多识别格式
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.QR_CODE,
            BarcodeFormat.DATA_MATRIX,
            BarcodeFormat.AZTEC,
            BarcodeFormat.PDF_417
        ]);
        // 尝试提高识别容忍度
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints);

        try {
            // 优先后置摄像头
            const constraints = { video: { facingMode: { ideal: "environment" } } };
            controlsRef.current = await reader.decodeFromConstraints(
                constraints,
                videoRef.current!,
                (result, err) => {
                    if (result?.getText()) {
                        onDecoded(result.getText());
                        // 保持预览不断，可根据需要自动停止：
                        controlsRef.current?.stop();
                        setActive(false);
                        setIsScannerRunning(false);
                        // 增加声音提示并滚动到结果区域
                        // const audio = new Audio("/path/to/success-sound.mp3");
                        // audio.play();
                        document.getElementById("result-area")?.scrollIntoView({ behavior: "smooth" });
                    }
                    if (err) {
                        // 过滤常见的连续扫描错误
                        if (err instanceof Error &&
                            err.message.includes("No MultiFormat Readers were able to detect the code")) {
                            // 扫描中不显示此类错误，避免闪烁
                            return;
                        } else if (err instanceof Error) {
                            setError(err.message || "二维码解析失败");
                        } else {
                            setError("无法解析二维码");
                        }
                    }
                }
            );
            setActive(true);
            setIsScannerRunning(true);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "无法启动摄像头");
            } else {
                setError("无法启动摄像头");
            }
        }
    };

    const stopScanning = () => {
        if (controlsRef.current) {
            controlsRef.current.stop();
            setActive(false);
            setIsScannerRunning(false);
        }
    };

    useEffect(() => {
        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
                setActive(false);
            }
        };
    }, []);

    async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = URL.createObjectURL(file);
            // 使用同一 reader 解析图片，增强配置
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.QR_CODE,
                BarcodeFormat.DATA_MATRIX,
                BarcodeFormat.AZTEC,
                BarcodeFormat.PDF_417
            ]);
            hints.set(DecodeHintType.TRY_HARDER, true);
            // 增加容错率
            hints.set(DecodeHintType.CHARACTER_SET, "UTF-8");
            const reader = new BrowserMultiFormatReader(hints);

            try {
                const result = await reader.decodeFromImageUrl(url);
                onDecoded(result.getText());
            } catch (decodeErr) {
                if (decodeErr instanceof Error &&
                    decodeErr.message.includes("No MultiFormat Readers were able to detect the code")) {
                    setError("无法识别图片中的二维码，请尝试使用清晰的二维码图片");
                } else {
                    throw decodeErr;
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "图片解析失败");
            } else {
                setError("图片解析失败");
            }
        }
    }
    // ...existing code...

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

            <div className="flex flex-wrap items-center gap-3">
                {!isScannerRunning ? (
                    <button
                        onClick={startScanning}
                        className="px-3 py-2 rounded-xl shadow cursor-pointer border bg-blue-500 text-white text-sm"
                    >
                        开始扫描
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="px-3 py-2 rounded-xl shadow cursor-pointer border bg-red-500 text-white text-sm"
                    >
                        停止扫描
                    </button>
                )}
                <label className="px-3 py-2 rounded-xl shadow cursor-pointer border text-sm">
                    从相册识别
                    <input type="file" accept="image/*" className="hidden" onChange={handlePickFile} />
                </label>
                {error && <span className="text-red-600 text-sm">{error}</span>}
            </div>
        </div>
    );
}