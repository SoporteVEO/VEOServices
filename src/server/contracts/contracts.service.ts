import { querySqlServer } from "@/db/sql_server";
import { EndingSoonContracts } from "./entities/ending_soon_contracts";
import fs from "fs";

export class ContractsService {
  private getEndingSoonContractsQuery = fs.readFileSync(
    "./src/server/contracts/get-ending-soon-contracts.sql",
    "utf8"
  );

  async getEndingSoonContracts(fechaDesde: Date, fechaHasta: Date) {
    const contracts = await querySqlServer(this.getEndingSoonContractsQuery, {
      FechaDesde: fechaDesde,
      FechaHasta: fechaHasta,
    });
    return this.mapContracts(contracts);
  }

  private mapContracts(contracts: any[]): EndingSoonContracts[] {
    return contracts.map((contract) => {
      return {
        id: contract.mconId,
        description: contract.mconAtencionA,
        start_date: contract.dconFechaDesde,
        end_date: contract.dconFechaHasta,
        contract_number: contract.mconCodigo,
        billboard_address: contract.sitiDireccion,
        customer_name: contract.cliNombres,
        customer_email: contract.cliEmail,
      };
    });
  }
}

export const contractsService = new ContractsService();
