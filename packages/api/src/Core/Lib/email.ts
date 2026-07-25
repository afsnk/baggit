
import { betterFetch } from "@better-fetch/fetch";

import env from "@/Core/Config/env";

export interface IEmailProps {
  to: string;
  subject: string;
  body: string;
  data?: Record<string, any>;
  from?: string
  name?: string;
  attachments?: Array<{ filename: string; content: any; contentType: string}>;
}
export async function sendEmail({ to, subject, body, data, from = "hello@baggit.link", name = "Baggit Services", attachments }: IEmailProps) {
  const { data: responseData, error } = await betterFetch<{
    success: boolean;
    data: any;
    timestamp: string;
  }>(`${env.PLUNK_API_URL}/v1/send`, {
    body: JSON.stringify({
      to,
      subject,
      body,
      data,
      name,
      from,
      attachments
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.PLUNK_API_KEY}`,
    },
    retry: {
      type: "linear",
      delay: 1000,
      attempts: 3,
    },
  });

  console.error({emailSent: true, to, subject, body, name})

  if (error) {
    console.log(`Failed to send email`, {error});
    throw error;
  }
  return responseData;
}
