import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email';

export interface SuccessPaymentUserEmailProps {
	status?: "successful" | "failed" | string;
	date?: Date | string;
	merchantName?: string;
	userName?: string;
	ngnAmount?: number;
	usdAmount?: number;
	currency?: string;
	paymentMethod?: string;
	invoiceNumber?: string;
	receiptLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const SuccessPaymentUserEmail = ({
	status,
	date,
	merchantName,
	userName,
	ngnAmount,
	usdAmount,
	invoiceNumber,
	receiptLink,
}: SuccessPaymentUserEmailProps) => {
  const previewText = `Payment ${status} to ${merchantName}`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
						<Section className="mt-[32px]">
							<Container className='bg-black size-20 rounded-full'>
								<Text className='text-center text-4xl'>💰</Text>
							</Container>
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
							Payment to <strong>{merchantName}</strong> was <strong className='capitalize'>{status}</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hello {userName},
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
	            Thanks for your payment! We have successfully received your payment for Invoice <strong>{invoiceNumber}</strong>,
							and processed to the merchant <strong>{merchantName}</strong>.
            </Text>
            <Section className='w-full'>
              <Row>
                <Column align="left">
                  <Text>Amount:</Text>
                </Column>
                <Column align='right'>
									<strong>NGN {ngnAmount?.toLocaleString(undefined, {})}</strong>
                </Column>
              </Row>
              <Row>
                <Column align="left">
                  <Text>Invoice ID:</Text>
                </Column>
                <Column align='right'>
									<strong>{invoiceNumber}</strong>
                </Column>
              </Row>
              <Row>
                <Column align="left">
                  <Text>Merchant:</Text>
                </Column>
                <Column align='right'>
									<strong>{merchantName}</strong>
                </Column>
              </Row>
              <Row>
                <Column align="left">
                  <Text>Status:</Text>
                </Column>
                <Column align='right'>
									<strong className='text-green-500'>{status}</strong>
                </Column>
              </Row>
              <Row>
                <Column align="left">
                  <Text>Transaction Date:</Text>
                </Column>
                <Column align='right'>
									<strong>{date?.toLocaleString()}</strong>
                </Column>
              </Row>
						</Section>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={receiptLink}
              >
	              Download receipt
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={receiptLink} className="text-blue-600 no-underline">
                {receiptLink}
              </Link>
						</Text>
            <Text>If you have any questions regarding this transaction, please contact the merchant directly or reply to this email.</Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was intended for{' '}
              <span className="text-black">{userName}</span>. If you
              were not expecting this email or did not make the above payment, you can ignore this email. If
              you are concerned about your account's safety, please reply to
              this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

SuccessPaymentUserEmail.PreviewProps = {
	status: 'sucessful',
	userName: 'Micheal Faraday',
	usdAmount: 14.59,
	ngnAmount: 20000,
	merchantName: 'Flowerboy',
	date: new Date("2026-07-17"),
	invoiceNumber: "0485843293845743LSD",
	receiptLink: 'https://api.baggit.dev/receipt/0485843293845743LSD/download'
} as SuccessPaymentUserEmailProps;

export default SuccessPaymentUserEmail;
