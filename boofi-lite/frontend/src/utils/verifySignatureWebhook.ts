import * as crypto from "crypto";

export const verifySignature = ({
  secret,
  signature,
  payload,
}: {
  secret: string;
  signature: string;
  payload: string;
}) => {
  const payloadSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  const trusted = `sha256=${payloadSignature}`;
  const untrusted = signature;

  console.log("Trusted:", trusted);
  console.log("Untrusted:", untrusted);

  return trusted === untrusted;
};

// Test the function
const secret = "dyn_{SECRET}";
const signature = "sha256={SIGNATURE}";
const payload = JSON.stringify({
  messageId: "",
  eventId: "",
  eventName: "",
  timestamp: "",
  webhookId: "",
  environmentId: "",
  data: {},
});

const isValid = verifySignature({ secret, signature, payload });
console.log("isValid", isValid);
