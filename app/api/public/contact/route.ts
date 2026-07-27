import { NextResponse } from "next/server";
import { execFile } from "child_process";

function sendEmailViaSendmail(emailContent: string): Promise<void> {
  return new Promise((resolve) => {
    const child = execFile("/usr/sbin/sendmail", ["-t"], (error) => {
      if (error) {
        console.error("Sendmail execution log:", error);
      }
      resolve();
    });

    if (child.stdin) {
      child.stdin.write(emailContent);
      child.stdin.end();
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: "Nama depan, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName || ""}`.trim();
    const targets = ["sales@tri-j.co.id", "sherly_59@yahoo.com", "teguhpras30@gmail.com"];

    const emailContent = [
      `To: ${targets.join(", ")}`,
      `From: sales@tri-j.co.id`,
      `Reply-To: ${fullName} <${email}>`,
      `Subject: [Pesan Kontak TRIJ] Dari ${fullName}`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      `Pesan baru dari Form Kontak Website tri-j.co.id:`,
      `==================================================`,
      `Nama Pengirim : ${fullName}`,
      `Email Pengirim: ${email}`,
      `Waktu         : ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
      `==================================================`,
      `Isi Pesan:`,
      `${message}`,
      `==================================================`,
    ].join("\n");

    // Send email via local Sendmail / Postfix transport
    await sendEmailViaSendmail(emailContent);

    return NextResponse.json({
      success: true,
      message: "Pesan Anda telah berhasil terkirim!",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengirim pesan kontak." },
      { status: 500 }
    );
  }
}
