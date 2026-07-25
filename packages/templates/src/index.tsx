import {render} from "react-email"
import { type MerchantInviteUserEmailProps, MerchantInviteUserEmail } from "./emails/merchant/merchant-invite-user";
import { SuccessPaymentUserEmail, type SuccessPaymentUserEmailProps } from "./emails/transaction/success-payment-user";
import { FailedPaymentUserEmail, type FailedPaymentUserEmailProps } from "./emails/transaction/failed-payment-user";

export type Template =
	| { name: "merchantTeamInvite"; props: MerchantInviteUserEmailProps }
	| { name: "successPayment", props: SuccessPaymentUserEmailProps }
	| { name: "failedPayment", props: FailedPaymentUserEmailProps };

const registry = {
	merchantTeamInvite: MerchantInviteUserEmail,
	successPayment: SuccessPaymentUserEmail,
  failedPayment: FailedPaymentUserEmail,
} as const;

export async function renderTemplate(t: Template): Promise<string> {
  const Component = registry[t.name];

  return render(<Component {...t.props} />, { pretty: false });
}

export async function renderTemplateText(t: Template): Promise<string> {
  const Component = registry[t.name];

  return render(<Component {...t.props} />, { plainText: true });
}
