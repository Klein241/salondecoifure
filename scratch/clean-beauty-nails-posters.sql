-- Mise à jour des affiches / prestations dans la table posters
UPDATE posters
SET 
  format = 'Manucure Signature',
  category = 'Manucure & Soins',
  dimensions = 'Soin des Mains',
  badge = 'POPULAIRE',
  features = '["Soin complet et limage doux des ongles","Traitement nourrissant des cuticules","Pose de vernis haute brillance au choix","Modelage relaxant des mains inclus"]'
WHERE id = 'post-01';

UPDATE posters
SET 
  format = 'Pose Permanente',
  category = 'Pose d''Ongles',
  dimensions = 'Capsules ou Gel',
  badge = 'TENDANCE',
  features = '["Pose complète gel ou capsules au choix","Forme personnalisée (Amande, Carré, Stiletto)","Finition French, couleur ou paillettes","Tenue longue durée ultra résistante"]'
WHERE id = 'post-02';

UPDATE posters
SET 
  format = 'Vernis Semi-Permanent',
  category = 'Vernis & Finitions',
  dimensions = 'Séchage Express LED',
  badge = 'COUP DE COEUR',
  features = '["Vernis semi-permanent éclatant","Large choix de teintes élégantes","Séchage immédiat sous lampe LED","Brillance miroir jusqu''à 3 semaines"]'
WHERE id = 'post-03';

UPDATE posters
SET 
  format = 'Vernis Semi-Permanent',
  category = 'Vernis & Finitions',
  dimensions = 'Pose Express',
  badge = 'SEMI-PERMANENT',
  description = 'Pose soignée de vernis semi-permanent aux couleurs vibrantes pour des mains sublimes.',
  features = '["Pose rapide et soignée de vernis","Tenue parfaite sans écaillement","Finition brillante longue durée"]'
WHERE id = 'post-1792144607507-0-e0dx';

UPDATE posters
SET 
  format = 'Pose Ongles Permanent',
  category = 'Pose d''Ongles',
  dimensions = 'Tenue Prolongée',
  badge = 'PERMANENT',
  description = 'Pose d''ongles permanente de qualité supérieure pour une élégance absolue.',
  features = '["Pose d''ongles permanente haute résistance","Rendu naturel et raffinement garanti","Finition impeccable et durable"]'
WHERE id = 'post-1792144608233-1-poce';

UPDATE posters
SET 
  format = 'Pédicure Spa Complète',
  category = 'Pédicure & Pieds',
  dimensions = 'Soin Pieds Relaxant',
  badge = 'SPA & BIEN-ÊTRE',
  features = '["Bain de pieds relaxant et gommage doux","Soin complet des ongles et cuticules","Hydratation profonde et modelage","Pose de vernis éclatant au choix"]'
WHERE id = 'post-04';
