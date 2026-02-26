import { contractsService } from "@/server/contracts/contracts.service";
import { emailService } from "@/server/email/email.service";
import { EndingSoonContractEmail } from "@/templates/email/ending-soon-contract";
import { notifiedContractService } from "@/server/notified-contract/notified-contract.service";
import { NotificationStatus } from "@/generated/prisma/browser";

const RATE_LIMIT_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class EndingSoonContractsWorker {
  async execute() {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15); // 15 days from now

    const contracts = await contractsService.getEndingSoonContractsFiltered(
      startDate,
      endDate
    );

    console.log(`Found ${contracts.length} contracts to send email`);

    for (const contract of contracts) {
      const { data, error } = await emailService.sendEmail(
        contract.customerEmail,
        "Contrato por vencer",
        EndingSoonContractEmail({ contract })
      );

      if (error) {
        console.error(
          `Error sending email to ${contract.customerEmail}: ${error.message}`
        );
        await notifiedContractService.create({
          contractSourceId: contract.contractSourceId,
          contractDetailSourceId: contract.contractDetailSourceId,
          contractNumber: contract.contractNumber,
          status: NotificationStatus.FAILED,
          errorMessage: error.message,
        });
      } else {
        console.log(`Email sent to ${contract.customerEmail}`);
        await notifiedContractService.create({
          contractSourceId: contract.contractSourceId,
          contractDetailSourceId: contract.contractDetailSourceId,
          contractNumber: contract.contractNumber,
          status: NotificationStatus.SENT,
        });
      }

      // Rate limit: at most 1 email per second
      await sleep(RATE_LIMIT_MS);
    }
  }
}
