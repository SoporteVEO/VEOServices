import type { EndingSoonContracts } from "@/server/contracts/entities/source_ending_soon_contracts";
import { formatLongDate } from "@/lib/utils";

interface EmailTemplateProps {
  contract: Omit<EndingSoonContracts, "startDate" | "endDate"> & {
    startDate?: Date | string;
    endDate: Date | string;
  };
}

export function EndingSoonContractEmail({ contract }: EmailTemplateProps) {
  const endDateFormatted = formatLongDate(contract.endDate);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "12px",
        color: "#1a1a1a",
        lineHeight: 1.5,
      }}
    >
      <p style={{ marginBottom: "16px" }}>
        Estimado/a <strong>{contract.customerName}</strong>,
      </p>
      <p style={{ marginBottom: "16px" }}>
        Le informamos que su contrato de valla publicitaria está por vencer. A
        continuación los detalles:
      </p>
      <table
        role="presentation"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 600,
                color: "#475569",
                width: "40%",
              }}
            >
              Número de contrato
            </td>
            <td
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {contract.contractNumber}
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Dirección de la valla
            </td>
            <td
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {contract.billboardAddress}
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "12px 16px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Fecha de vencimiento
            </td>
            <td style={{ padding: "12px 16px" }}>
              <strong style={{ color: "#b91c1c" }}>{endDateFormatted}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginBottom: "8px", fontSize: "14px", color: "#64748b" }}>
        Si desea renovar o tiene alguna consulta, no dude en contactar con su
        representante de ventas.
      </p>
      <p style={{ marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
        Atentamente,
        <br />
        <strong>VEO</strong>
      </p>
    </div>
  );
}
