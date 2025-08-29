import fs from "fs";
import path from "path";

let numFoundErrors = 0;

const rootDir = path.join(__dirname, "..");
const excludedDirectories = [
  ["node_modules"],
  [".git"],
  ["client", "node_modules"],
  ["client", "src"],
  ["common", "node_modules"],
  ["common", "src"],
  ["server", "node_modules"],
  ["server", "src"],
  ["portal", "node_modules"],
  ["portal", "src"],
].map((it) => path.join(rootDir, ...it));

const versionNumbers: {
  [index: string]: string;
} = {};

walkFileTree(rootDir, excludedDirectories, "package.json", (path) => {
  const content = JSON.parse(fs.readFileSync(path, { encoding: "utf8" }));
  versionNumbers[path] = content["version"];

  const dependencyNames = Object.keys(content["dependencies"] || []);
  if (!dependencyNames.every(isSortedPredicate)) {
    logError(
      path,
      "UnsortedDependencies",
      "dependencies are not sorted alphabetically! Should be in this order: " + dependencyNames.sort().join(", "),
    );
  }

  const devDependencyNames = Object.keys(content["devDependencies"] || []);
  if (!devDependencyNames.every(isSortedPredicate)) {
    logError(
      path,
      "UnsortedDevDependencies",
      "devDependencies are not sorted alphabetically! Should be in this order: " + devDependencyNames.sort().join(", "),
    );
  }
});

const uniqueVersionNumbers = Object.values(versionNumbers).filter(filterUniqueOnlyPredicate);
if (uniqueVersionNumbers.length > 1) {
  const errorMessage = "Version numbers are not the same for all subprojects! (" + uniqueVersionNumbers.join(", ") + ")";
  Object.entries(versionNumbers).forEach((value: [string, string]) => {
    logError(value[0], "DifferentVersionNumbers", errorMessage);
  });
} else if (uniqueVersionNumbers.length < 1) {
  logError("package.json", "MissingVersion", "No version number found in any package");
}

process.exit(numFoundErrors);

/*******************************************
 * Functions: ******************************
 *******************************************/

function logError(file: string, title: string, message: string) {
  console.log("::error file=" + file + ",title=" + title + "::" + message);
  numFoundErrors++;
}

/**
 * Utility that can be passed to {@link Array.prototype.every} to check if the string array is in its natural order
 */
function isSortedPredicate(value: string, index: number, array: string[]) {
  return index === 0 || array[index - 1] <= value;
}
/**
 * Utility that can be passed to {@link Array.prototype.filter} to filter out all duplicate values.
 * Thus the resulting array contains all unique values from the original array.
 * Only the first occurrence of each of all unique values is returned.
 */
function filterUniqueOnlyPredicate<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

function walkFileTree(
  currentPath: string,
  excludedPaths: string[],
  targetFileName: string,
  targetFileAction: (path: string) => void,
  indentation = "",
) {
  if (!fs.existsSync(currentPath) || excludedPaths.some((excludedPath) => (currentPath + "/").startsWith(excludedPath + "/"))) {
    return; // skip this path
  }

  fs.readdirSync(currentPath).forEach((file) => {
    const filePath = path.join(currentPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      walkFileTree(
        filePath,
        excludedPaths.filter((it) => it.startsWith(filePath)), // only pass on exclusions below `filename`
        targetFileName,
        targetFileAction,
        indentation + "  ",
      );
    } else if (file === targetFileName) {
      targetFileAction(filePath);
    }
  });
}
