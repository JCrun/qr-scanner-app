// src/lib/parseQr.ts
export type QrRecord = {
  生产令号?: string;
  开工时间?: string;
  完工时间?: string;
  计划箱号?: string;
  批次箱号?: string;
  员工工号?: string;
  设备编码?: string;
  成品数量?: string;
  待处理数?: string;
  工作时长?: string;
  热处理号?: string;
  表面处理?: string;
  体检报告?: string;
  备用1?: string;
  物料信息?: string;
  产品批次?: string;
  装模清单?: string;
  二维码类型?: string;
  前热处理数?: string;
  前表面处理数?: string;
  前工序数量?: string;
  原文?: string;
};

const headers = [
  "生产令号","开工时间","完工时间","计划箱号","批次箱号","员工工号","设备编码","成品数量","待处理数","工作时长","热处理号","表面处理","体检报告","备用1","物料信息","产品批次","装模清单","二维码类型","前热处理数","前表面处理数","前工序数量",
];

function toTime(s?: string) {
  // 期望格式: YYMMDDhhmmss 或 12~14 位数字
  if (!s) return s;
  const m = s.match(/^(\d{12,14})$/);
  if (!m) return s; // 无法解析则原样返回
  const v = m[1];
  const Y = v.length === 12 ? `20${v.slice(0,2)}` : v.slice(0,4);
  const M = v.length === 12 ? v.slice(2,4) : v.slice(4,6);
  const D = v.length === 12 ? v.slice(4,6) : v.slice(6,8);
  const h = v.length === 12 ? v.slice(6,8) : v.slice(8,10);
  const m2 = v.length === 12 ? v.slice(8,10) : v.slice(10,12);
  const s2 = v.length === 12 ? v.slice(10,12) : v.slice(12,14);
  return `${Y}-${M}-${D} ${h}:${m2}:${s2}`;
}

export function parseQr(raw: string): QrRecord {
  const parts = raw.split(/\s*,\s*/); // 逗号分隔，去空格
  const out: QrRecord = { 原文: raw };
  headers.forEach((h, i) => {
    let v = parts[i] ?? "";
    if (h === "开工时间" || h === "完工时间") v = toTime(v) ?? v;
    (out as any)[h] = v;
  });
  return out;
}