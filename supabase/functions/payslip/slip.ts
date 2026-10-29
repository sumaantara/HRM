// ONEderland HRM — payslip PDF layout (jsPDF), A4 portrait, corporate style. Pure: data in, PDF bytes out.
import { jsPDF } from "npm:jspdf@4.2.1";

export type Img = { data: string; w: number; h: number; type: "PNG" | "JPEG" } | null;
export type SlipData = {
  company: string; no: string; payDate: string; period: string; place: string;
  name: string; empNo: string; position: string; division: string; dept: string; office: string; status: string;
  address: string; phone: string; joinDate: string;
  income: [string, number][]; deduction: [string, number][];
  attendance?: [string, string][];
  bank?: { name: string; account: string; holder: string };
  signerName: string; signerTitle: string;
  letterhead: Img; stamp: Img; signature: Img;
  password?: string; ownerPassword?: string; preview?: boolean;
  divisions?: string[];
};

const W = 595.28, H = 841.89, M = 40;
type RGB = [number, number, number];
const ink: RGB = [21, 26, 45], ink2: RGB = [58, 65, 87], muted: RGB = [110, 116, 137], line: RGB = [221, 225, 236], soft: RGB = [245, 246, 250];
const navy: RGB = [27, 42, 84], accent: RGB = [53, 84, 245], green: RGB = [20, 128, 74], greenSoft: RGB = [227, 245, 234];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Indonesian money: 20.000.000 / 2.101.595,15
const money = (n: number) => { const v = Math.round((n || 0) * 100) / 100; const [i, d] = Math.abs(v).toFixed(2).split("."); return (v < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d !== "00" ? "," + d : ""); };
export const dmy = (iso: string) => { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso || ""); };
const longDate = (iso: string) => { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : String(iso || ""); };
const periodLong = (p: string) => { const m = String(p || "").match(/^(\d{4})-(\d{2})$/); return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : p; };
const tenure = (join: string, at: string) => {
  const a = String(join || "").match(/^(\d{4})-(\d{2})/), b = String(at || "").match(/^(\d{4})-(\d{2})/); if (!a || !b) return "";
  const mo = (Number(b[1]) - Number(a[1])) * 12 + Number(b[2]) - Number(a[2]); if (mo < 0) return "";
  return mo < 12 ? `${mo} bulan` : `${Math.floor(mo / 12)} tahun${mo % 12 ? ` ${mo % 12} bulan` : ""}`;
};
// amount in words (terbilang), rupiah only
export function terbilang(n: number): string {
  const u = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  const t = (x: number): string => {
    x = Math.floor(x);
    if (x < 12) return u[x]; if (x < 20) return t(x - 10) + " belas"; if (x < 100) return t(x / 10) + " puluh" + (x % 10 ? " " + t(x % 10) : "");
    if (x < 200) return "seratus" + (x - 100 ? " " + t(x - 100) : ""); if (x < 1000) return t(x / 100) + " ratus" + (x % 100 ? " " + t(x % 100) : "");
    if (x < 2000) return "seribu" + (x - 1000 ? " " + t(x - 1000) : ""); if (x < 1e6) return t(x / 1000) + " ribu" + (x % 1000 ? " " + t(x % 1000) : "");
    if (x < 1e9) return t(x / 1e6) + " juta" + (x % 1e6 ? " " + t(x % 1e6) : ""); if (x < 1e12) return t(x / 1e9) + " miliar" + (x % 1e9 ? " " + t(x % 1e9) : "");
    return t(x / 1e12) + " triliun" + (x % 1e12 ? " " + t(x % 1e12) : "");
  };
  const v = Math.max(0, Math.round(n || 0)); const s = v ? t(v) : "nol";
  return (s.charAt(0).toUpperCase() + s.slice(1) + " rupiah").replace(/\s+/g, " ");
}

export function buildSlip(d: SlipData): Uint8Array {
  const opts: Record<string, unknown> = { unit: "pt", format: "a4", orientation: "portrait", compress: true };
  if (d.password) opts.encryption = { userPassword: d.password, ownerPassword: d.ownerPassword || crypto.randomUUID(), userPermissions: ["print"] };
  const doc = new jsPDF(opts as never);
  doc.setProperties({ title: `Slip Gaji ${d.name} ${periodLong(d.period)}`, subject: "Payslip", author: d.company, creator: "ONEderland HRM" });
  type T = { size?: number; bold?: boolean; color?: RGB; align?: "left" | "right" | "center"; italic?: boolean; maxW?: number };
  const txt = (s: string, x: number, y: number, o: T = {}) => {
    doc.setFont("helvetica", o.bold ? (o.italic ? "bolditalic" : "bold") : o.italic ? "italic" : "normal");
    doc.setFontSize(o.size || 9); doc.setTextColor(...(o.color || ink));
    let v = String(s ?? ""); if (o.maxW) while (v.length > 3 && doc.getTextWidth(v) > o.maxW) v = v.slice(0, -2).trimEnd() + "…";
    doc.text(v, x, y, { align: o.align || "left" });
  };
  const img = (im: Img, x: number, y: number, maxW: number, maxH: number, align: "left" | "center" | "right" = "left") => {
    if (!im) return 0; const k = Math.min(maxW / im.w, maxH / im.h); const w = im.w * k, h = im.h * k;
    doc.addImage(im.data, im.type, align === "center" ? x - w / 2 : align === "right" ? x - w : x, y, w, h, undefined, "FAST"); return h;
  };
  const rect = (x: number, y: number, w: number, h: number, fill: RGB, r = 0) => { doc.setFillColor(...fill); r ? doc.roundedRect(x, y, w, h, r, r, "F") : doc.rect(x, y, w, h, "F"); };
  const hline = (x1: number, x2: number, y: number, c: RGB = line, w = 0.6) => { doc.setDrawColor(...c); doc.setLineWidth(w); doc.line(x1, y, x2, y); };

  // ── header ───────────────────────────────────────────────────────────────
  rect(0, 0, W, 5, navy); rect(W * 0.62, 0, W * 0.38, 5, accent);
  let y = 30;
  if (d.letterhead) { y = 16 + img(d.letterhead, M, 16, W - 2 * M - 150, 64) + 4; }
  else { txt(d.company, M, 48, { size: 15, bold: true, color: navy, maxW: W - 2 * M - 170 }); txt("Human Resources · Payroll", M, 62, { size: 8, color: muted }); y = 70; }
  txt("SLIP GAJI", W - M, 46, { size: 18, bold: true, color: navy, align: "right" });
  txt(`PAYSLIP · ${periodLong(d.period).toUpperCase()}`, W - M, 60, { size: 8, bold: true, color: accent, align: "right" });
  y = Math.max(y, 72);
  hline(M, W - M, y + 6, navy, 1.2);

  // reference band: payslip no · period · pay date · confidential
  y += 18; rect(M, y, W - 2 * M, 36, soft, 6);
  const band: [string, string][] = [["No. Slip", d.no], ["Periode", periodLong(d.period)], ["Tanggal Bayar", longDate(d.payDate)]];
  const bw = (W - 2 * M - 110) / 3;
  band.forEach(([k, v], i) => { const x = M + 14 + i * bw; txt(k.toUpperCase(), x, y + 14, { size: 6.5, bold: true, color: muted }); txt(v, x, y + 27, { size: 9, bold: true, maxW: bw - 12 }); });
  doc.setDrawColor(...(d.preview ? [178, 98, 5] as RGB : green)); doc.setLineWidth(0.9); doc.roundedRect(W - M - 96, y + 9, 84, 18, 9, 9, "S");
  txt(d.preview ? "PREVIEW" : "RAHASIA · ASLI", W - M - 54, y + 21, { size: 7, bold: true, color: d.preview ? [178, 98, 5] : green, align: "center" });

  // ── employee ─────────────────────────────────────────────────────────────
  y += 54;
  txt("DATA KARYAWAN", M, y, { size: 7, bold: true, color: accent }); txt("EMPLOYEE", M + 74, y, { size: 7, color: muted });
  y += 8; hline(M, W - M, y);
  const colW = (W - 2 * M) / 2, LW = 84;
  const left: [string, string][] = [["NIK / Nama", `${d.empNo} – ${d.name}`], ["Jabatan", d.position || "-"], ["Divisi", d.division || "-"], ["Departemen", d.dept || "-"]];
  const ten = tenure(d.joinDate, d.payDate);
  const right: [string, string][] = [["Status", d.status || "-"], ["Kantor", d.office || "-"], ["Tanggal Masuk", d.joinDate ? longDate(d.joinDate) : "-"], ["Masa Kerja", ten || "-"]];
  const info = (list: [string, string][], x: number) => list.forEach(([k, v], i) => { const yy = y + 16 + i * 15; txt(k, x, yy, { size: 8.5, color: muted }); txt(":", x + LW - 6, yy, { size: 8.5, color: muted }); txt(v, x + LW, yy, { size: 8.8, bold: i === 0, maxW: colW - LW - 12 }); });
  info(left, M); info(right, M + colW + 8);
  y += 16 + 4 * 15 - 4;

  // ── attendance recap (from the HRM) ─────────────────────────────────────
  if (d.attendance?.length) {
    y += 10; const n = d.attendance.length, gap = 6, cw = (W - 2 * M - gap * (n - 1)) / n;
    d.attendance.forEach(([k, v], i) => { const x = M + i * (cw + gap); rect(x, y, cw, 34, soft, 5); txt(v, x + cw / 2, y + 15, { size: 10.5, bold: true, align: "center" }); txt(k, x + cw / 2, y + 27, { size: 6.5, color: muted, align: "center", maxW: cw - 4 }); });
    y += 34;
  }

  // ── earnings / deductions ───────────────────────────────────────────────
  y += 18; const gutter = 16, tw = (W - 2 * M - gutter) / 2, RH = 17;
  const table = (title: string, sub: string, list: [string, number][], x: number) => {
    rect(x, y, tw, 22, navy, 4); txt(title, x + 10, y + 14.5, { size: 8.5, bold: true, color: [255, 255, 255] }); txt(sub, x + tw - 10, y + 14.5, { size: 7, color: [200, 208, 235], align: "right" });
    list.forEach(([k, v], i) => { const yy = y + 22 + i * RH; if (i % 2) rect(x, yy, tw, RH, [250, 251, 253]);
      txt(k, x + 10, yy + 11.5, { size: 8.6, color: ink2, maxW: tw - 110 }); txt(v ? money(v) : "-", x + tw - 10, yy + 11.5, { size: 8.6, align: "right", color: v ? ink : muted }); hline(x, x + tw, yy + RH, [236, 239, 245], 0.4); });
  };
  const rows = Math.max(d.income.length, d.deduction.length, 1);
  table("PENERIMAAN", "EARNINGS", d.income, M); table("POTONGAN", "DEDUCTIONS", d.deduction, M + tw + gutter);
  const gross = d.income.reduce((s, [, v]) => s + (v || 0), 0), ded = d.deduction.reduce((s, [, v]) => s + (v || 0), 0), take = gross - ded;
  let ty = y + 22 + rows * RH;
  const total = (label: string, v: number, x: number) => { hline(x, x + tw, ty, navy, 0.9); txt(label, x + 10, ty + 14, { size: 8.8, bold: true }); txt(`Rp ${money(v)}`, x + tw - 10, ty + 14, { size: 9, bold: true, align: "right" }); };
  total("Total Penerimaan", gross, M); total("Total Potongan", ded, M + tw + gutter);
  y = ty + 30;

  // ── take home pay ───────────────────────────────────────────────────────
  rect(M, y, W - 2 * M, 54, greenSoft, 8); rect(M, y, 5, 54, green);
  txt("TAKE HOME PAY", M + 18, y + 20, { size: 8, bold: true, color: green }); txt("Gaji bersih yang dibayarkan", M + 18, y + 32, { size: 7.5, color: muted });
  txt(`Rp ${money(take)}`, W - M - 16, y + 27, { size: 18, bold: true, color: ink, align: "right" });
  txt(`Terbilang: ${terbilang(take)}`, M + 18, y + 46, { size: 7.5, italic: true, color: ink2, maxW: W - 2 * M - 36 });
  y += 72;

  // ── payment + signatures ────────────────────────────────────────────────
  const bank = d.bank && (d.bank.name || d.bank.account) ? d.bank : null;
  txt("DITRANSFER KE", M, y, { size: 7, bold: true, color: accent }); txt("PAID TO", M + 66, y, { size: 7, color: muted });
  if (bank) { txt(bank.name || "-", M, y + 15, { size: 9, bold: true }); txt(`No. Rek ${bank.account || "-"}`, M, y + 28, { size: 8.6 }); txt(`a.n. ${bank.holder || d.name}`, M, y + 41, { size: 8.6 }); }
  else txt("Sesuai rekening yang terdaftar di HRD", M, y + 15, { size: 8.6, color: muted });
  const sx1 = W - M - 270, sx2 = W - M - 90;
  txt(`${d.place ? d.place + ", " : ""}${longDate(d.payDate)}`, W - M, y, { size: 8.6, align: "right" });
  const sy = y + 20;
  txt("Disetujui oleh", sx1, sy, { size: 8.2, color: muted, align: "center" }); txt("Diterima oleh", sx2, sy, { size: 8.2, color: muted, align: "center" });
  img(d.stamp, sx1 - 60, sy + 2, 78, 78); img(d.signature, sx1, sy + 10, 110, 52, "center");
  hline(sx1 - 72, sx1 + 72, sy + 70, ink, 0.7); hline(sx2 - 72, sx2 + 72, sy + 70, ink, 0.7);
  txt(d.signerName || " ", sx1, sy + 82, { size: 8.8, bold: true, align: "center", maxW: 150 }); txt(d.signerTitle || "", sx1, sy + 93, { size: 7.5, color: muted, align: "center", maxW: 150 });
  txt(d.name, sx2, sy + 82, { size: 8.8, bold: true, align: "center", maxW: 150 }); txt("Karyawan", sx2, sy + 93, { size: 7.5, color: muted, align: "center" });

  // ── preview watermark & footer ──────────────────────────────────────────
  if (d.preview) { doc.saveGraphicsState(); doc.setGState(new (doc as unknown as { GState: new (o: unknown) => unknown }).GState({ opacity: 0.08 }) as never); txt("PREVIEW", W / 2, H / 2 + 40, { size: 110, bold: true, color: [178, 98, 5], align: "center" }); doc.restoreGraphicsState(); }
  hline(M, W - M, H - 52);
  txt("Dokumen ini bersifat RAHASIA dan hanya untuk karyawan yang bersangkutan. Slip gaji diterbitkan secara elektronik dan sah tanpa tanda tangan basah.", W / 2, H - 38, { size: 6.8, color: muted, align: "center" });
  txt(`${d.company} · ${d.no} · ${periodLong(d.period)}${d.password ? " · dilindungi kata sandi (tanggal lahir DDMMYYYY)" : ""} · ONEderland HRM`, W / 2, H - 27, { size: 6.5, color: muted, align: "center" });
  return new Uint8Array(doc.output("arraybuffer"));
}
