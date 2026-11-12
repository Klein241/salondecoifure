// ========================================================
// MOTEUR D'IMPRESSION DU REÇU OFFICIEL D'ENCAISSEMENT & ÉCHÉANCIER
// ========================================================
export const printOrderReceipt = (order, countryConfig = {}, settings = {}) => {
  if (!order) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour télécharger le reçu KTFA FLEX.');
    return;
  }

  const tranchesRows = (order.installments || []).map(inst => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${inst.tranche}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${inst.date}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${inst.ref}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #047857;">${inst.amount.toLocaleString()} FCFA</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${inst.status === 'Payé' ? '#d1fae5' : '#fef3c7'}; color: ${inst.status === 'Payé' ? '#065f46' : '#92400e'};">
          ${inst.status}
        </span>
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Reçu Officiel - ${order.receiptNumber} - KTFA FLEX</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background: #f8fafc; color: #0f172a; padding: 30px; font-size: 13px; line-height: 1.5; }
        .receipt-box { max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 20px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #10b981; }
        .brand-title { font-size: 26px; font-weight: 900; color: #047857; letter-spacing: -0.5px; }
        .brand-subtitle { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .receipt-meta { text-align: right; }
        .receipt-badge { display: inline-block; background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 6px; }
        .receipt-number { font-size: 15px; font-weight: 800; font-family: monospace; color: #0f172a; }
        .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #047857; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
        .info-card p { margin-bottom: 4px; }
        .info-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .info-value { font-size: 13px; font-weight: 700; color: #0f172a; }
        .product-box { display: flex; gap: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 16px; margin: 20px 0; align-items: center; }
        .product-img { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; border: 1px solid #10b981; }
        .product-title { font-size: 15px; font-weight: 800; color: #065f46; margin-bottom: 4px; }
        .product-cat { font-size: 11px; color: #047857; font-weight: 600; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
        .totals-table { width: 100%; max-width: 340px; margin-left: auto; margin-top: 10px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .totals-row.final { font-size: 16px; font-weight: 900; color: #047857; border-top: 2px solid #10b981; padding-top: 8px; margin-top: 6px; }
        .stamp-box { display: flex; justify-content: space-between; align-items: center; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
        .official-stamp { display: inline-block; border: 2px solid #047857; padding: 8px 16px; border-radius: 10px; text-align: center; color: #047857; transform: rotate(-3deg); font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 28px; line-height: 1.4; }
        .print-actions { text-align: center; margin-top: 24px; }
        .btn-print { background: #10b981; color: #ffffff; border: none; padding: 12px 28px; font-size: 14px; font-weight: 800; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        @media print {
          body { padding: 0; background: #fff; }
          .receipt-box { border: none; box-shadow: none; padding: 15px; }
          .print-actions { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-box">
        <div class="header">
          <div>
            <div class="brand-title" style="display: flex; align-items: center; gap: 8px;">
              <img src="/logos/ktfa_official_logo.jpg" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" alt="KTFA" />
              <span>KTFA FLEX</span>
            </div>
            <div class="brand-subtitle">Marketplace & Paiement Échelonné — ${countryConfig.name || 'Cameroun'} ${countryConfig.flag || '🇨🇲'}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Service Financier & Facilités de Crédit • ${countryConfig.primaryCity || 'Douala'} & ${countryConfig.secondaryCity || 'Yaoundé'}</div>
          </div>
          <div class="receipt-meta">
            <span class="receipt-badge">REÇU OFFICIEL CERTIFIÉ</span>
            <div class="receipt-number">${order.receiptNumber}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Date : ${order.orderDate}</div>
            <div style="font-size: 11px; color: #64748b;">Réf : ${order.transactionRef}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-card">
            <div class="section-title">Client Souscripteur</div>
            <div class="info-label">Nom & Prénom(s)</div>
            <div class="info-value">${order.recipientName || 'Client KTFA'}</div>
            <div style="margin-top: 6px;">
              <div class="info-label">Téléphone / WhatsApp</div>
              <div class="info-value">${order.recipientPhone || '+237 699 00 00 00'}</div>
            </div>
            <div style="margin-top: 6px;">
              <div class="info-label">Adresse de livraison</div>
              <div class="info-value">${order.deliveryAddress || 'Douala, Cameroun'}</div>
            </div>
          </div>

          <div class="info-card">
            <div class="section-title">Modalités de Financement</div>
            <div class="info-label">Mode de règlement</div>
            <div class="info-value">${order.paymentMode}</div>
            <div style="margin-top: 6px;">
              <div class="info-label">Statut du dossier</div>
              <div class="info-value" style="color: ${order.statusCategory === 'delivered' ? '#047857' : (order.statusCategory === 'paid_pending' ? '#0284c7' : '#d97706')};">
                ${(order.statusLabel || '').toUpperCase()}
              </div>
            </div>
            <div style="margin-top: 6px;">
              <div class="info-label">Suivi Logistique</div>
              <div class="info-value">${order.deliveryTracking?.status || 'Validé au registre'}</div>
            </div>
          </div>
        </div>

        <div class="product-box">
          <img src="${order.image_url}" alt="${order.title}" class="product-img" />
          <div>
            <div class="product-cat">${order.category}</div>
            <div class="product-title">${order.title}</div>
            <div style="font-size: 12px; color: #334155;">N° Commande : <strong>${order.id}</strong></div>
          </div>
        </div>

        <div class="section-title" style="margin-top: 24px;">Calendrier & Décompte des Règlements</div>
        <table>
          <thead>
            <tr>
              <th>Échéance / Tranche</th>
              <th>Date d'Opération</th>
              <th>Référence Transaction</th>
              <th style="text-align: right;">Montant</th>
              <th style="text-align: center;">État</th>
            </tr>
          </thead>
          <tbody>
            ${tranchesRows}
          </tbody>
        </table>

        <div class="totals-table">
          <div class="totals-row">
            <span style="color: #64748b; font-weight: 600;">Valeur Totale du Produit :</span>
            <span style="font-weight: 800;">${order.totalPrice.toLocaleString()} FCFA</span>
          </div>
          <div class="totals-row">
            <span style="color: #047857; font-weight: 600;">Total Déjà Encaissé :</span>
            <span style="font-weight: 800; color: #047857;">${order.paidAmount.toLocaleString()} FCFA</span>
          </div>
          <div class="totals-row">
            <span style="color: #e11d48; font-weight: 600;">Solde Restant à Régler :</span>
            <span style="font-weight: 800; color: #e11d48;">${order.remainingAmount.toLocaleString()} FCFA</span>
          </div>
          <div class="totals-row final">
            <span>STATUT DOSSIER :</span>
            <span>${order.remainingAmount === 0 ? 'SOLDÉ 100%' : 'EN COURS (ACTIF)'}</span>
          </div>
        </div>

        <div class="stamp-box">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #475569;">Émis par le système automatisé :</div>
            <div style="font-size: 12px; font-weight: 800; color: #047857;">KTFA FLEX — PAIEMENT & COTISATION EN LIGNE</div>
            <div style="font-size: 10px; color: #94a3b8;">Plateforme Officielle KTFA Marketplace ${countryConfig.name || 'Cameroun'} ${countryConfig.flag || '🇨🇲'}</div>
          </div>
          <div class="official-stamp">
            ★ CERTIFIÉ CONFORME ★<br>
            KTFA FLEX ${countryConfig.name || 'CAMEROUN'} ${countryConfig.flag || '🇨🇲'}<br>
            TRANSACTION SÉCURISÉE
          </div>
        </div>

        <div class="footer-note">
          Ce reçu électronique constitue une preuve légale d'encaissement et de réservation de marchandise sous convention d'échelonnement KTFA FLEX.<br>
          Pour toute assistance ou demande : WhatsApp officiel KTFA.
        </div>
      </div>

      <div class="print-actions">
        <button onclick="window.print()" class="btn-print">🖨️ Imprimer ou Enregistrer en PDF</button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const printOfficialReceipt = printOrderReceipt;

