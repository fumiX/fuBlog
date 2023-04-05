import * as assert from "assert";
import test from "node:test";
import { convertToHumanReadableFileSize } from "../../src/index.js";

test("binary filesizes", () => {
  // bytes
  assertFileSize("-1", "", "B", "binary", -1);
  assertFileSize("0", "", "B", "binary", 0);
  assertFileSize("1.023", "", "B", "binary", 1023);
  // kibibytes
  assertFileSize("1", "", "kiB", "binary", 1024);
  // gibibytes
  assertFileSize("1.024", "", "GiB", "binary", 1099511627775);
  // tebibytes
  assertFileSize("1", "", "TiB", "binary", 1099511627776);
});
test("various decimal filesizes", () => {
  // bytes
  assertFileSize("-1", "", "B", "decimal", -1);
  assertFileSize("0", "", "B", "decimal", 0);
  assertFileSize("999", "", "B", "decimal", 999);
  //kilobytes
  assertFileSize("1", "", "kB", "decimal", 1000);
  // terabytes
  assertFileSize("1.000", "", "GB", "decimal", 999999999999);
  // terabytes
  assertFileSize("1", "", "TB", "decimal", 1000000000000);
});

function assertFileSize(
  expectedInt: string,
  expectedDecimals: string | undefined,
  expectedUnit: string,
  type: "binary" | "decimal",
  actualNumberOfBytes: number,
) {
  const expectedGermanInt = expectedInt.replace(",", ".");
  assert.strictEqual(
    convertToHumanReadableFileSize(actualNumberOfBytes, type, "de"),
    `${expectedGermanInt}${expectedDecimals ? `,${expectedDecimals}` : ""} ${expectedUnit}`,
    `Expected ${actualNumberOfBytes} bytes to be formatted differently for German locale!`,
  );
  const expectedEnglishInt = expectedInt.replace(".", ",");
  assert.strictEqual(
    convertToHumanReadableFileSize(actualNumberOfBytes, type, "en"),
    `${expectedEnglishInt}${expectedDecimals ? `.${expectedDecimals}` : ""} ${expectedUnit}`,
    `Expected ${actualNumberOfBytes} bytes to be formatted differently for English locale!`,
  );
}
