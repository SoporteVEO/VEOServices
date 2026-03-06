SELECT
    car.caraId,
    car.caraCodigo,

    siti.sitiReferencia AS [Referencia],
    siti.sitiDireccion  AS [Dirección],
    dpto.dptoId         AS [DepartamentoId],
    dpto.dptoNombre     AS [Departamento],
    muni.muniNombre     AS [Municipio],
    calle.callNombre    AS [Calle],

    car.caraAlto        AS [Alto],
    car.caraAncho       AS [Ancho],

    siti.sitiGPSLat     AS [Latitud],
    siti.sitiGPSLon     AS [Longitud],

    ISNULL(prca_def.prcaPrecioMax, prca_def.Precio) AS [Precio],

    img.imagId            AS [ImagenId],
    img.imagImagen        AS [Imagen],
    img.imagFecha         AS [ImagenFecha],
    img.imagObservaciones AS [ImagenObservaciones]

FROM olVallas.dbo.Caras AS car WITH (NOLOCK)
INNER JOIN olVallas.dbo.Sitios AS siti WITH (NOLOCK)
    ON car.sitiId = siti.sitiId

LEFT JOIN olComun.dbo.DeptosEstados AS dpto WITH (NOLOCK)
    ON siti.dptoId = dpto.dptoId
LEFT JOIN olComun.dbo.MuniCondados AS muni WITH (NOLOCK)
    ON siti.muniId = muni.muniId
LEFT JOIN olComun.dbo.Calles AS calle WITH (NOLOCK)
    ON siti.callId = calle.callId

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

OUTER APPLY (
    SELECT TOP 1
        i.imagId,
        i.imagImagen,
        i.imagFecha,
        i.imagObservaciones
    FROM olVallas.dbo.imagenes i WITH (NOLOCK)
    WHERE i.caraId = car.caraId
    AND i.tiimId <> 1
    AND i.tiimId <> 5
    ORDER BY i.imagFecha DESC, i.imagId DESC
) img

WHERE
    siti.sitiActivo = 1
    AND car.caraActivo = 1
    AND dpto.dptoId = @DepartamentoId
    AND ISNULL(prca_def.prcaPrecioMax, prca_def.Precio) >= 5
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
ORDER BY car.caraCodigo DESC;

