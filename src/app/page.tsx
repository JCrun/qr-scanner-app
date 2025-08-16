// src/app/page.tsx
import ClientPanel from "@/components/ClientPanel";

export default function Page() {
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">二维码扫描识别</h1>
      <ClientPanel />
    </main>
  );
}

