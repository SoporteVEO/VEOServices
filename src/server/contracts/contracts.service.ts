import { queryBriloDatabase } from "@/db/sql_server";
import { EndingSoonContracts } from "./entities/source_ending_soon_contracts";
import {
  NotificationStatus,
  NotifiedContract,
} from "@/generated/prisma/client";
import prisma from "@/db/prisma-service";
import fs from "fs";

class ContractsService {
  private getEndingSoonContractsQuery = fs.readFileSync(
    "./src/server/contracts/get-ending-soon-contracts.sql",
    "utf8"
  );

  async getEndingSoonContractsFiltered(fechaDesde: Date, fechaHasta: Date) {
    const sourceRows = (await queryBriloDatabase(
      this.getEndingSoonContractsQuery,
      {
        FechaDesde: fechaDesde,
        FechaHasta: fechaHasta,
      }
    )) as { dconId: number }[];

    if (sourceRows.length === 0) return [];

    const sourceIdsInRange = sourceRows.map((r) => r.dconId);
    const notified = await prisma.notifiedContract.findMany({
      where: {
        contractDetailSourceId: { in: sourceIdsInRange },
        status: { not: NotificationStatus.FAILED },
      },
      select: { contractDetailSourceId: true },
    });
    const notifiedSourceIds = new Set(
      notified.map((n) => n.contractDetailSourceId)
    );

    const notYetNotified = sourceRows.filter(
      (row) => !notifiedSourceIds.has(row.dconId)
    );

    return this.mapSourceContracts(notYetNotified);
  }

  async getEndingSoonContracts(fechaDesde: Date, fechaHasta: Date) {
    const contracts = await queryBriloDatabase(
      this.getEndingSoonContractsQuery,
      {
        FechaDesde: fechaDesde,
        FechaHasta: fechaHasta,
      }
    );
    return this.mapSourceContracts(contracts);
  }

  async getNotifiedContracts() {
    const contracts = await prisma.notifiedContract.findMany({
      where: {
        status: NotificationStatus.SENT,
      },
    });
    return contracts as NotifiedContract[];
  }

  private mapSourceContracts(contracts: any[]): EndingSoonContracts[] {
    return contracts.map((contract) => {
      return {
        contractSourceId: contract.mconId,
        contractDetailSourceId: contract.dconId,
        description: contract.mconAtencionA,
        startDate: contract.dconFechaDesde,
        endDate: contract.dconFechaHasta,
        contractNumber: contract.mconCodigo,
        billboardAddress: contract.sitiDireccion,
        customerName: contract.cliNombres,
        customerEmail: contract.cliEmail,
      };
    });
  }
}

export const contractsService = new ContractsService();

// Cached helpers
export async function getCachedEndingSoonContracts(from: Date, to: Date) {
  "use cache";
  return await contractsService.getEndingSoonContracts(from, to);
}

export async function getCachedNotifiedContracts() {
  "use cache";
  return await contractsService.getNotifiedContracts();
}
