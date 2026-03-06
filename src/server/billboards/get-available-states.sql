SELECT
    dpto.dptoId      AS departamentoId,
    dpto.dptoNombre  AS departamento,
    COUNT(DISTINCT car.caraId) AS availableCount
FROM olVallas.dbo.Caras AS car WITH (NOLOCK)
INNER JOIN olVallas.dbo.Sitios AS siti WITH (NOLOCK)
    ON car.sitiId = siti.sitiId
LEFT JOIN olComun.dbo.DeptosEstados AS dpto WITH (NOLOCK)
    ON siti.dptoId = dpto.dptoId
LEFT JOIN (
    SELECT
        pc1.caraId,
        MAX(CASE WHEN tp1.tiprEsDefault = 1 THEN pc1.prcaPrecio ELSE NULL END) AS prcaPrecioMax,
        MAX(pc1.prcaPrecio) AS Precio
    FROM olVallas.dbo.PreciosXCaras pc1 WITH (NOLOCK)
    INNER JOIN olVallas.dbo.TiposPrecios tp1 WITH (NOLOCK)
        ON pc1.tiprId = tp1.tiprId
    GROUP BY pc1.caraId
) AS prca_def
    ON prca_def.caraId = car.caraId
    AND ISNULL(prca_def.prcaPrecioMax, prca_def.Precio) >= 5
WHERE
    siti.sitiActivo = 1
    AND car.caraActivo = 1
    AND dpto.dptoId IS NOT NULL
    AND prca_def.Precio IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM olVallas.dbo.detContratos detcon WITH (NOLOCK)
        INNER JOIN olVallas.dbo.maeContratos maecon WITH (NOLOCK)
            ON maecon.mconId = detcon.mconId
        WHERE detcon.caraId = car.caraId
          AND maecon.mconPosteado <> 0
          AND maecon.mconAnulado <> 1
          AND detcon.dconFechaDesde <= @FechaFin
          AND detcon.dconFechaHasta >= @FechaInicio
    )
GROUP BY dpto.dptoId, dpto.dptoNombre
ORDER BY dpto.dptoNombre ASC;

