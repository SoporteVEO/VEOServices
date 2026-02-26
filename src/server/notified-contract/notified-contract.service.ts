import { CreateNotifiedContractDto } from "./dto/create.notified-contract";
import { NotifiedContract } from "@/generated/prisma/client";
import prisma from "@/db/prisma-service";

class NotifiedContractService {
  async create(dto: CreateNotifiedContractDto): Promise<NotifiedContract> {
    const notifiedContract = await prisma.notifiedContract.create({
      data: {
        contractSourceId: dto.contractSourceId,
        contractDetailSourceId: dto.contractDetailSourceId,
        contractNumber: dto.contractNumber,
        status: dto.status,
        errorMessage: dto.errorMessage ?? null,
      },
    });
    return notifiedContract;
  }
}

export const notifiedContractService = new NotifiedContractService();
