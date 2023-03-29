const unitDefinitions = <const>{
  binary: { units: ["B", "kiB", "MiB", "GiB", "TiB"], base: 1024 },
  decimal: { units: ["B", "kB", "MB", "GB", "TB"], base: 1000 },
};
type UnitType = keyof typeof unitDefinitions;

export function convertToHumanReadableFileSize(
  numBytes: number,
  type: UnitType = "binary",
  locales: Intl.LocalesArgument | undefined = undefined,
): string {
  const unitDefinition = unitDefinitions[type];
  const exponent = Math.max(
    0,
    Math.min(unitDefinition.units.length - 1, Math.floor(Math.log(Math.abs(numBytes)) / Math.log(unitDefinition.base))),
  );

  return `${(numBytes / Math.pow(unitDefinition.base, exponent)).toLocaleString(locales)} ${unitDefinition.units[exponent]}`;
}
