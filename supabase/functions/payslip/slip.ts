// ONEderland HRM — payslip PDF layout (jsPDF). Pure: data in, PDF bytes out.
import { jsPDF } from "npm:jspdf@4.2.1";

export type Img = { data: string; w: number; h: number; type: "PNG" | "JPEG" } | null;
export type SlipData = {
  company: string; no: string; payDate: string; period: string;
  name: string; empNo: string; position: string; division: string; divisions: string[];
  address: string; phone: string; joinDate: string;
  income: [string, number][]; deduction: [string, number][];
  signerName: string; signerTitle: string;
  letterhead: Img; stamp: Img; signature: Img;
  password?: string; ownerPassword?: string; preview?: boolean;
};

const W = 648, H = 576;
const ink: [number, number, number] = [21, 26, 45], muted: [number, number, number] = [110, 116, 137], navy: [number, number, number] = [31, 48, 94];
const money = (n: number) => !n ? "-" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const dmy = (iso: string) => { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso || ""); };

export function buildSlip(d: SlipData): Uint8Array {
  const opts: Record<string, unknown> = { unit: "pt", format: [W, H], orientation: "landscape", compress: true };
  if (d.password) opts.encryption = { userPassword: d.password, ownerPassword: d.ownerPassword || crypto.randomUUID(), userPermissions: ["print"] };
  const doc = new jsPDF(opts as never);
  doc.setProperties({ title: `Payslip ${d.name} ${d.period}`, subject: "Payslip", author: d.company, creator: "ONEderland HRM" });
  const txt = (s: string, x: number, y: number, o: { size?: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center"; italic?: boolean } = {}) => {
    doc.setFont("helvetica", o.bold ? (o.italic ? "bolditalic" : "bold") : o.italic ? "italic" : "normal");
    doc.setFontSize(o.size || 9.5); doc.setTextColor(...(o.color || ink)); doc.text(String(s ?? ""), x, y, { align: o.align || "left" });
  };
  const img = (im: Img, x: number, y: number, maxW: number, maxH: number, align: "left" | "center" = "left") => {
    if (!im) return 0; const k = Math.min(maxW / im.w, maxH / im.h); const w = im.w * k, h = im.h * k;
    doc.addImage(im.data, im.type, align === "center" ? x - w / 2 : x, y, w, h, undefined, "FAST"); return h;
  };

  // header: uploaded letterhead (full width) or the company name
  let top = 34;
  if (d.letterhead) { top = img(d.letterhead, 0, 0, W, 132) + 14; }
  else { txt(d.company, 40, 58, { size: 20, bold: true, color: navy }); doc.setDrawColor(...navy); doc.setLineWidth(1.2); doc.line(40, 70, W - 40, 70); top = 92; }

  // left: employee block
  const L = 18, LV = 112, R = 432, RV = 510; let y = top;
  const row = (label: string, value: string, yy: number) => { txt(label, L, yy); txt(":", LV - 8, yy); txt(value, LV, yy); };
  row("Employee Name", d.name, y);
  // division checkboxes (two per line after the first three, like the paper form)
  txt("Division", L, y + 16); txt(":", LV - 8, y + 16);
  let cx = LV, cy = y + 16; doc.setLineWidth(0.6); doc.setDrawColor(...muted);
  for (const dv of d.divisions) {
    doc.setFontSize(7.2); const tw = doc.getTextWidth(dv) + 18;
    if (cx + tw > R - 6) { cx = LV; cy += 13; }
    doc.rect(cx, cy - 6.5, 7, 7);
    if (dv.toLowerCase() === (d.division || "").toLowerCase()) { doc.setFillColor(...navy); doc.rect(cx, cy - 6.5, 7, 7, "F"); doc.setDrawColor(255, 255, 255); doc.setLineWidth(1.1); doc.line(cx + 1.4, cy - 3, cx + 3, cy - 1.2); doc.line(cx + 3, cy - 1.2, cx + 5.8, cy - 5); doc.setDrawColor(...muted); doc.setLineWidth(0.6); }
    txt(dv, cx + 10, cy, { size: 7.2 }); cx += tw;
  }
  y = cy + 18;
  row("Position", d.position, y);
  const addr = doc.splitTextToSize(d.address || "-", R - LV - 16) as string[];
  txt("Address", L, y + 16 + (addr.length > 1 ? 5 : 0)); txt(":", LV - 8, y + 16 + (addr.length > 1 ? 5 : 0));
  addr.slice(0, 3).forEach((a, i) => txt(a, LV, y + 16 + i * 11));
  y += 16 + Math.max(1, Math.min(3, addr.length)) * 11 + 6;
  row("Phone Number", d.phone || "-", y);

  // right: number block + ASLI
  const rrow = (label: string, value: string, yy: number) => { txt(label, R, yy); txt(":", RV - 10, yy); txt(value, RV, yy, { size: value.length > 22 ? 7.6 : value.length > 18 ? 8.4 : 9.5 }); };
  rrow("No", d.no, top); rrow("Date", dmy(d.payDate), top + 16); rrow("Employee ID", d.empNo, top + 32); rrow("Join Date", dmy(d.joinDate), top + 48);
  doc.setFillColor(d.preview ? 253 : 196, d.preview ? 241 : 196, d.preview ? 223 : 196); doc.rect(R + 64, top + 58, W - (R + 64) - 8, 34, "F");
  txt(d.preview ? "PREVIEW" : "ASLI", R + 64 + (W - (R + 64) - 8) / 2, top + 80, { size: 14, bold: true, align: "center", color: d.preview ? [178, 98, 5] : ink });

  // income / deduction
  y += 30; const mid = 330;
  txt("INCOME", L, y, { bold: true, size: 10.5 }); txt("DEDUCTION", mid + 6, y, { bold: true, size: 10.5 });
  const ly = (list: [string, number][], x0: number, colon: number, rp: number, amt: number) => list.forEach(([k, v], i) => { const yy = y + 18 + i * 17; txt(k, x0, yy); txt(":", colon, yy); txt("Rp", rp, yy); txt(money(v), amt, yy, { align: "right" }); });
  ly(d.income, L, 150, 162, mid - 6); ly(d.deduction, mid + 6, 470, 482, 560);
  const rows = Math.max(d.income.length, d.deduction.length);
  doc.setDrawColor(...ink); doc.setLineWidth(0.8); doc.line(mid, y - 10, mid, y + 8 + rows * 17);
  const gross = d.income.reduce((s, [, v]) => s + (v || 0), 0), ded = d.deduction.reduce((s, [, v]) => s + (v || 0), 0), take = gross - ded;
  const ty = y + 18 + rows * 17 + 2;
  txt(`Total income  Rp ${money(gross)}`, mid - 6, ty, { size: 8, color: muted, align: "right" }); txt(`Total deduction  Rp ${money(ded)}`, 560, ty, { size: 8, color: muted, align: "right" });
  doc.setFillColor(198, 224, 180); doc.rect(372, ty + 8, 196, 22, "F");
  txt("Take home pay", 378, ty + 23, { bold: true, size: 10.5 }); txt(":", 456, ty + 23, { bold: true, size: 10.5 }); txt("Rp", 466, ty + 23, { bold: true, size: 10.5 }); txt(money(take), 562, ty + 23, { bold: true, size: 10.5, align: "right" });

  // signatures: employee (left), accounting with signature + company stamp (right)
  const sy = Math.max(ty + 70, H - 120);
  txt("Employee", 92, sy, { italic: true, align: "center" });
  txt(d.signerTitle || "Accounting", 340, sy, { italic: true, align: "center" });
  img(d.stamp, 280, sy - 22, 92, 92);
  img(d.signature, 345, sy + 2, 80, 64, "center");
  doc.setDrawColor(...ink); doc.setLineWidth(0.8); doc.line(18, sy + 70, 172, sy + 70); doc.line(262, sy + 70, 416, sy + 70);
  txt(d.signerName || "", 340, sy + 66, { align: "center" });
  txt(`Payslip ${d.period} · ${d.no} · issued electronically by ${d.company} through ONEderland HRM${d.password ? " · password protected" : ""}`, W / 2, H - 14, { size: 6.5, color: muted, align: "center" });
  return new Uint8Array(doc.output("arraybuffer"));
}
