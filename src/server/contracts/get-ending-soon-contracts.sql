SELECT DISTINCT
TOP 1
    maecon.mconId,
    detcon.dconId,
    maecon.mconAtencionA,
    detcon.dconFechaHasta,
    detcon.dconFechaDesde,
    maecon.mconCodigo,
    siti.sitiDireccion,
    cli.cliNombres,
    cli.cliEmail
FROM olVallas.dbo.maeContratos maecon
INNER JOIN olVallas.dbo.detContratos detcon
    ON detcon.mconId = maecon.mconId
INNER JOIN olVallas.dbo.Caras car
    ON detcon.caraId = car.caraId
INNER JOIN olVallas.dbo.Sitios siti
    ON car.sitiId = siti.sitiId
INNER JOIN olComun.dbo.Clientes cli
    ON maecon.cliId = cli.cliId
WHERE maecon.mconPosteado <> 0
  AND maecon.mconAnulado <> 1
  AND detcon.dconFechaHasta >= @FechaDesde
  AND detcon.dconFechaHasta <  @FechaHasta
  AND NOT EXISTS (
      SELECT 1
      FROM olVallas.dbo.maeContratos child
      WHERE child.mconIdPadre = maecon.mconId
        AND child.mconAnulado <> 1
        AND child.mconPosteado <> 0
  )
ORDER BY detcon.dconFechaHasta ASC;