import { NotificationStatus } from "@/generated/prisma/browser";

export class CreateNotifiedContractDto {
  contractSourceId!: number;
  contractDetailSourceId!: number;
  contractNumber!: string;
  status!: NotificationStatus;
  errorMessage?: string;
}
