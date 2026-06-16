import React, { useState } from "react";
import { QrCode, Download, Copy, Check, Smartphone } from "lucide-react";

const C = {
  bg: "#0b0b0b", card: "#111", border: "#222", text: "#e0e0e0", muted: "#666",
  gold: "#d4af37", goldDark: "#aa771c", green: "#22c55e"
};

export default function QRCodeGenerator({ value, label, size = 200, showActions = true, color = "d4af37", bgColor = "0b0b0b" }) {
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=${color}&bgcolor=${bgColor}&margin=1&format=png`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qr-${label || "code"}.png`;
    link.click();
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
      background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px",
      padding: "24px", maxWidth: `${size + 80}px`
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px", padding: "12px",
        boxShadow: "0 4px 20px rgba(212,175,55,0.15)",
        border: `2px solid ${C.gold}40`,
        position: "relative",
        width: `${size + 24}px`, height: `${size + 24}px`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#fff", borderRadius: "10px", zIndex: 2
          }}>
            <QrCode size={40} style={{ color: "#ccc", animation: "qrPulse 1.5s infinite" }} />
          </div>
        )}
        <img
          src={qrUrl}
          alt={`QR Code: ${label || value}`}
          width={size}
          height={size}
          style={{ borderRadius: "6px", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
          onLoad={() => setLoaded(true)}
          crossOrigin="anonymous"
        />
      </div>

      {label && (
        <p style={{
          fontSize: "0.85rem", fontWeight: "600", color: C.gold,
          textAlign: "center", margin: 0, letterSpacing: "0.05em"
        }}>
          {label}
        </p>
      )}

      <p style={{
        fontSize: "0.72rem", color: C.muted, textAlign: "center",
        margin: 0, wordBreak: "break-all", maxWidth: `${size}px`,
        lineHeight: "1.4"
      }}>
        {value.length > 60 ? value.substring(0, 60) + "..." : value}
      </p>

      {showActions && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={handleCopy}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "8px",
              background: copied ? `${C.green}22` : `${C.gold}15`,
              border: `1px solid ${copied ? C.green : C.gold}44`,
              color: copied ? C.green : C.gold,
              fontSize: "0.78rem", fontWeight: "600", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copie !" : "Copier le lien"}
          </button>
          <button
            onClick={handleDownload}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "8px",
              background: `${C.gold}15`,
              border: `1px solid ${C.gold}44`,
              color: C.gold,
              fontSize: "0.78rem", fontWeight: "600", cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Download size={13} />
            Telecharger
          </button>
        </div>
      )}

      <style>{`
        @keyframes qrPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export function QRCodeSection({ siteUrl = "https://thealphabeauty.com", referralCode, clientName }) {
  const bookingUrl = `${siteUrl}/reservation`;
  const referralUrl = referralCode ? `${siteUrl}/reservation?ref=${referralCode}` : null;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px"
      }}>
        <Smartphone size={20} style={{ color: C.gold }} />
        <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
          QR Codes
        </h3>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
      }}>
        <QRCodeGenerator
          value={bookingUrl}
          label="Reservation en ligne"
          size={180}
        />

        {referralUrl && (
          <QRCodeGenerator
            value={referralUrl}
            label={`Parrainage ${clientName || ""}`}
            size={180}
          />
        )}

        <QRCodeGenerator
          value={siteUrl}
          label="Site Web"
          size={180}
        />
      </div>
    </div>
  );
}
