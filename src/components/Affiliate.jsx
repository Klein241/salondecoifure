import React from "react"
import { Gift, Heart, UserPlus, Trophy, Sparkles } from "lucide-react"

export default function Affiliate({ onGoToPortal }) {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Obtenez votre code",
      description: "Créez un compte client gratuit ou connectez-vous pour obtenir votre code de parrainage personnalisé."
    },
    {
      icon: Gift,
      title: "2. Offrez -10%",
      description: "Partagez votre code. Vos ami(e)s reçoivent une réduction de 10% sur le soin de leur choix lors de leur réservation."
    },
    {
      icon: Trophy,
      title: "3. Cumulez des Points",
      description: "Gagnez 100 points de fidélité pour chaque ami(e) parrainé(e) qui effectue son premier soin chez nous."
    }
  ];

  const rewards = [
    { points: 300, reward: "Soin des mains ou massage crânien gratuit (durée 20 min)" },
    { points: 500, reward: "Soin Simple gratuit (Nettoyage de peau & hydratation)" },
    { points: 800, reward: "Soin Complet ou Soins Entre Jambes gratuit (durée 60-90 min)" },
    { points: 1000, reward: "Rituel Premium complet : Soins Éclaircissant + Modelage (durée 120 min)" }
  ];

  return (
    <section
      id="affiliate"
      style={{
        padding: "100px 24px",
        background: "#0d0d0d",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
            PROGRAMME AMBASSADEUR
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "16px" }}>
            Partagez la Beauté, <span className="gold-text">Gagnez des Soins</span>
          </h2>
          <div style={{ width: "80px", height: "2px", background: "var(--gold-grad)", margin: "0 auto 24px" }} />
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
            Invitez vos ami(e)s à découvrir l'expérience The Alpha Beauty et bénéficiez ensemble d'avantages exclusifs.
          </p>
        </div>

        {/* How It Works Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            marginBottom: "60px",
          }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: "32px",
                  textAlign: "center",
                  border: "1px solid rgba(212, 175, 55, 0.12)",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(212, 175, 55, 0.08)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    color: "var(--primary-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "var(--text-primary)" }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Rewards Section */}
        <div
          className="glass-panel"
          style={{
            padding: "40px",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            background: "rgba(18, 18, 18, 0.5)",
            maxWidth: "800px",
            margin: "0 auto 50px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", justifyContent: "center" }}>
            <Heart size={20} style={{ color: "var(--primary-gold)" }} />
            <h3 style={{ fontSize: "1.4rem", textAlign: "center" }}>Tableau des Récompenses</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {rewards.map((reward, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Sparkles size={14} style={{ color: "var(--primary-gold)" }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{reward.reward}</span>
                </div>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "var(--primary-gold)",
                    background: "rgba(212,175,55,0.1)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                  }}
                >
                  {reward.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <button onClick={onGoToPortal} className="btn-gold" style={{ padding: "16px 40px" }}>
            Rejoindre le Programme & Parrainer
          </button>
        </div>
      </div>
    </section>
  );
}
