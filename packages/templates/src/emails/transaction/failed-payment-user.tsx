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

export interface FailedPaymentUserEmailProps {
	status?: "failed" | string;
	date?: Date | string;
	merchantName?: string;
	userName?: string;
	ngnAmount?: number;
	usdAmount?: number;
	currency?: string;
	paymentMethod?: string;
	invoiceNumber?: string;
	retryLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const FailedPaymentUserEmail = ({
	status,
	date,
	merchantName,
	userName,
	ngnAmount,
	usdAmount,
	invoiceNumber,
	retryLink,
}: FailedPaymentUserEmailProps) => {
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
							Payment to <strong>{merchantName}</strong>, <strong className='capitalize'>{status}</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hello {userName},
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
							Your payment for Invoice <strong>{invoiceNumber}</strong>, to the merchant <strong>{merchantName}</strong> has failed.
						</Text>
            <Text>The details of the payments are below:</Text>
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
									<strong className='text-red-500'>{status}</strong>
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
            <Text>You can retry the payment by clicking the button below.</Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={retryLink}
              >
	              Retry payment
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={retryLink} className="text-blue-600 no-underline">
                {retryLink}
              </Link>
						</Text>
            <Text>If you have any questions regarding this transaction, please contact the merchant directly or reply to this email.</Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was intended for{' '}
              <span className="text-black">{userName}</span>. If you
              were not expecting this email or did not attempt the above payment, you can ignore this email. If
              you are concerned about your account's safety, please reply to
              this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

FailedPaymentUserEmail.PreviewProps = {
	status: 'failed',
	userName: 'Micheal Faraday',
	usdAmount: 14.59,
	ngnAmount: 20000,
	merchantName: 'Flowerboy',
	date: new Date("2026-07-17"),
	invoiceNumber: "0485843293845743LSD",
	retryLink: 'https://pay.baggit.dev/r/0485843293845743LSD'
} as FailedPaymentUserEmailProps;

export default FailedPaymentUserEmail;
