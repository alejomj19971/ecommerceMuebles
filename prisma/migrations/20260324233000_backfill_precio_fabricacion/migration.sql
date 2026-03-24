UPDATE "productos" p
SET "precio_fabricacion" = COALESCE(
  (
    SELECT ROUND(SUM(pm."cantidad" * m."precio_unitario")::numeric, 2)
    FROM "producto_materiales" pm
    JOIN "materiales" m ON m."id" = pm."id_material"
    WHERE pm."id_producto" = p."id"
  ),
  0
);
