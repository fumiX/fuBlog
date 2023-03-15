import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { X509Certificate } from "crypto";
import { createCA } from "mkcert";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const numMillisecondsPerDay = 1000 * 60 * 60 * 24;

const caCrtPath = `${__dirname}/ca.crt`;
const caKeyPath = `${__dirname}/ca.key`;

let skipCaGeneration = false;
try {
  const caCert = readFileSync(caCrtPath);
  const caKey = readFileSync(caKeyPath);

  if (caCert && caKey) {
    // Check if CA cert is still valid
    const caCertParsed = new X509Certificate(caCert);
    console.log(caCertParsed.validTo);
    const numValidMilliseconds = Date.parse(caCertParsed.validTo) - Date.now();
    const numValidDays = Math.floor(numValidMilliseconds / numMillisecondsPerDay);
    console.log(`CA is valid for ${numValidDays} days and ${(numValidMilliseconds - numValidDays * numMillisecondsPerDay) / 1000} seconds`);
    // If CA cert is valid more than 30 days, skip regeneration
    if (numValidDays > 30) {
      skipCaGeneration = true;
    }
  }
} catch (e) {}

if (!skipCaGeneration) {
  console.log("Generate new certificate authority …");

  await createCA({
    organization: "FumiX/fuBlog (development)",
    countryCode: "DE",
    state: "some state",
    locality: "somewhere",
    validityDays: 365,
  }).then(async (ca) => {
    writeFileSync(
      caCrtPath,
      `CA certificate used for testdata portal.\nIn order to regenerate this, delete the file and restart the testdata portal.\n${ca.cert}`,
      { encoding: "utf8" },
    );
    writeFileSync(caKeyPath, ca.key);
  });
} else {
  console.log("Certificate authority is not regenerated, the existing one can be reused.");
}
