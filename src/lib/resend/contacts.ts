import { Resend } from "resend";

type SyncMarketingContactInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  subscribed: boolean;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}

function getAudienceId() {
  return process.env.RESEND_AUDIENCE_ID || undefined;
}

export async function syncMarketingContact(input: SyncMarketingContactInput) {
  const resend = getResendClient();
  const audienceId = getAudienceId();

  const updateResult = await resend.contacts.update({
    audienceId,
    email: input.email,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    unsubscribed: !input.subscribed,
  });

  if (!updateResult.error) {
    return updateResult.data;
  }

  const createResult = await resend.contacts.create({
    audienceId,
    email: input.email,
    firstName: input.firstName ?? undefined,
    lastName: input.lastName ?? undefined,
    unsubscribed: !input.subscribed,
  });

  if (createResult.error) {
    throw createResult.error;
  }

  return createResult.data;
}
