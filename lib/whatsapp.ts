/**
 * WhatsApp Gateway OTP Service
 * Supporting Local Self-Hosted Baileys Gateway (http://localhost:3005), Fonnte, Wablas, & Fallback logger.
 */

export function formatWhatsAppNumber(phone: string): string {
  let cleaned = String(phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export async function sendWhatsAppOtp(phone: string, otpCode: string, name?: string): Promise<{ success: boolean; message: string; data?: any }> {
  const targetNumber = formatWhatsAppNumber(phone);
  const fonnteToken = process.env.FONNTE_TOKEN || process.env.WA_GATEWAY_TOKEN || '';
  const localGatewayUrl = process.env.LOCAL_WA_GATEWAY_URL || 'http://localhost:3005/send-otp';

  const messageText = `Halo ${name || 'Pelanggan TRI J'} 👋\n\nKode OTP verifikasi pendaftaran akun TRI J Anda adalah: *${otpCode}*\n\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.\n\nTerima kasih,\n*TRI J Official Store*`;

  console.log(`\n========================================`);
  console.log(`📱 WHATSAPP OTP OUTGOING NOTIFICATION`);
  console.log(`   Target Number : +${targetNumber}`);
  console.log(`   OTP Code      : [ ${otpCode} ]`);
  console.log(`   Name          : ${name || 'Customer'}`);
  console.log(`========================================\n`);

  // 1. Try Local Self-Hosted Baileys Gateway (port 3005)
  try {
    const localRes = await fetch(localGatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: targetNumber,
        message: messageText,
      }),
      // Short 2.5s timeout for checking if local WA Gateway service is running
      signal: AbortSignal.timeout(2500),
    });

    if (localRes.ok) {
      const localData = await localRes.json();
      console.log("✅ LOCAL BAILEYS WA GATEWAY SENT OTP:", localData);
      return {
        success: true,
        message: "Kode OTP berhasil dikirim ke WhatsApp Anda via Local Gateway!",
        data: localData,
      };
    }
  } catch (err: any) {
    // Local gateway not running or offline, proceed to Fonnte or fallback
  }

  // 2. Try Fonnte WhatsApp Gateway API if token is provided
  if (fonnteToken) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: fonnteToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: targetNumber,
          message: messageText,
          countryCode: "62",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Fonnte WA OTP API Response:", data);
        return {
          success: true,
          message: "Kode OTP berhasil dikirim ke WhatsApp Anda!",
          data,
        };
      }
    } catch (err: any) {
      console.warn("⚠️ Fonnte WA OTP Error:", err.message);
    }
  }

  // 3. Fallback mode (Console logger)
  console.warn(`⚠️ Local Gateway (port 3005) & FONNTE_TOKEN not active. Fonnte OTP message logged in console for testing.`);
  return {
    success: true,
    message: `OTP [${otpCode}] dikirim ke +${targetNumber} (Server Logger).`,
  };
}
