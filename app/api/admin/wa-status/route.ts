import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/admin/wa-status - Check live WA Gateway connection status
export async function GET() {
  try {
    const res = await fetch("http://localhost:3005/status", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ status: "disconnected", account: null, error: "Gateway offline" });
  } catch (err: any) {
    return NextResponse.json({ status: "disconnected", account: null, error: err?.message || "Offline" });
  }
}

// POST /api/admin/wa-status - Test send WA OTP message to a target number
export async function POST(req: Request) {
  try {
    const { target, message } = await req.json();
    if (!target) {
      return NextResponse.json({ error: "Nomor tujuan (target) wajib diisi." }, { status: 400 });
    }

    const testMsg = message || `Halo dari Admin TRI J Store 👋\n\nIni adalah pesan pengujian koneksi WhatsApp Gateway Server.\n\nStatus: Terhubung & Aktif! ✅`;

    const res = await fetch("http://localhost:3005/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, message: testMsg }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error || "Gagal mengirim pesan via WA Server." }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: `Pesan tes WA berhasil terkirim ke ${target}!`, data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Terjadi kesalahan saat menguji pengiriman WA." }, { status: 500 });
  }
}
