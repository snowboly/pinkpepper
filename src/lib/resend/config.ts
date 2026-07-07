export function getResendFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? process.env.RESEND_FROM;
}
