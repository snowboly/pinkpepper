import { Resend } from "resend";

type SyncMarketingContactInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  subscribed: boolean;
};

type ResendContactError = {
  message?: string;
  name?: string;
  statusCode?: number | null;
};

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.warn("Skipping Resend marketing contact sync: missing RESEND_API_KEY or RESEND_AUDIENCE_ID.");
    return null;
  }

  return {
    resend: new Resend(apiKey),
    audienceId,
  };
}

function isDuplicateContactError(error: ResendContactError | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  const name = error?.name?.toLowerCase() ?? "";

  return (
    error?.statusCode === 409 ||
    name.includes("duplicate") ||
    name.includes("conflict") ||
    message.includes("already exists") ||
    message.includes("already exist") ||
    message.includes("duplicate")
  );
}

function isContactNotFoundError(error: ResendContactError | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  const name = error?.name?.toLowerCase() ?? "";

  return (
    error?.statusCode === 404 ||
    name.includes("not_found") ||
    name.includes("not found") ||
    message.includes("not found") ||
    message.includes("could not find")
  );
}

export async function syncMarketingContact(input: SyncMarketingContactInput) {
  const config = getResendConfig();

  if (!config) {
    return null;
  }

  const { resend, audienceId } = config;

  if (!input.subscribed) {
    const updateResult = await resend.contacts.update({
      audienceId,
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      unsubscribed: true,
    });

    if (!updateResult.error) {
      return updateResult.data;
    }

    if (isContactNotFoundError(updateResult.error)) {
      return null;
    }

    throw updateResult.error;
  }

  const createPayload = {
    audienceId,
    email: input.email,
    firstName: input.firstName ?? undefined,
    lastName: input.lastName ?? undefined,
    unsubscribed: false,
  };

  const createResult = await resend.contacts.create(createPayload);

  if (!createResult.error) {
    return createResult.data;
  }

  if (!isDuplicateContactError(createResult.error)) {
    throw createResult.error;
  }

  const updateResult = await resend.contacts.update({
    audienceId,
    email: input.email,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    unsubscribed: false,
  });

  if (updateResult.error) {
    throw updateResult.error;
  }

  return updateResult.data;
}
