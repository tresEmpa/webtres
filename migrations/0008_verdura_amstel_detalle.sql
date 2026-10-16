-- Detalle opcional por producto + cambios de carta (oct 2026)
ALTER TABLE productos ADD COLUMN detalle TEXT;
UPDATE productos SET nombre='Empanada de Verdura', detalle='Acelga, muzzarella, morrón y cebolla' WHERE id='empanada-calabaza';
UPDATE productos SET nombre='Lata Budweiser o Amstel' WHERE id='budweiser-lata';
UPDATE productos SET precio=3000 WHERE categoria='Snacks';
