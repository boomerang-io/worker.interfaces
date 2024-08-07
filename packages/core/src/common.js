import * as log from "./log.js";
import params from "./params.js";
import results from "./results.js";
import filePath from "path";
import fs from "fs";

export function createFile() {
  //Create file on file system
  log.debug("Started Create File Plugin");
  const { path, content } = params;

  try {
    fs.writeFile(path + "", content, (err) => {
      if (err) {
        log.err(err);
        throw err;
      }
      log.good(
        "The file was succesfully saved! File contents:\n",
        fs.readFileSync(path, "utf-8")
      );
    });
  } catch (e) {
    log.err(e);
    process.exit(1);
  }

  log.debug("Finished Create File Plugin");
}
export async function readFileToProperty() {
  //Read in a file and set contents as an output property
  log.debug("Started Read File to Property Plugin");
  const { path: path, propertyName: propertyName } = params;
  try {
    const file = fs.readFileSync(path, "utf8");
    await results({ [propertyName]: file });
  } catch (e) {
    log.err(e);
    process.exit(1);
  }

  log.debug("Finished Read File to Property Plugin");
}

export async function readPropertiesFromFile() {
  //Read in a file of type properties file and parse every property (based on a delimiter, default being '=') and set as output properties.
  log.debug("Started Read Properties From File Plugin");
  const { path, delimiter = "=" } = params;
  const delimiterExpression = new RegExp(`${delimiter}(.+)`);

  try {
    const file = fs.readFileSync(path, "utf-8");

    const fileArray = file.split("\r\n");
    let fileObject = {};

    fileArray.forEach((file) => {
      let fileData = file.split(delimiterExpression);
      fileObject[fileData[0]] = fileData[1];
    });
    await results(fileObject);
  } catch (e) {
    log.err(e);
    process.exit(1);
  }

  log.debug("Finished Read Properties From File Plugin");
}
export function checkFileOrFolderExists() {
  //Return true if file or folder exists based on regular expression
  log.debug("Started Check File or Folder Exists Plugin");
  const { path, expression } = params;

  this.checkFileOrFolderExistsWithProps(path, expression);

  log.debug("Finished Check File or Folder Exists Plugin");
}
export function checkFileOrFolderExistsWithProps(path, expression) {
  //Used to check if the path indicates a file or a directory
  const fileExtension = filePath.extname(path);
  try {
    //Search for files and directories that match the expression inside the path dir
    if (expression && !fileExtension) {
      const regExp = new RegExp(expression);
      fs.readdir(path, (err, files) => {
        let filteredFiles = files.filter((file) => {
          return regExp.test(file);
        });
        if (filteredFiles.length === 0)
          throw new Error("Regex expression doesn't match any file.");
      });
    } else {
      fs.stat(path, (err, stat) => {
        if (!stat) throw new Error("File not found.");
      });
    }
    log.good("The file/directory was found!");
  } catch (e) {
    log.err(e);
    process.exit(1);
  }
}
export function checkFileContainsString() {
  // Check if a file contains string or matches regular expression
  log.debug("Started Check File Contains String Plugin");
  const { path, expression, flags, failIfNotFound = false } = params;

  this.checkFileContainsStringWithProps(
    path,
    expression,
    flags,
    failIfNotFound
  );

  log.debug("Finished Check File Contains String Plugin");
}
export function checkFileContainsStringWithProps(
  path,
  expression,
  flags,
  failIfNotFound
) {
  try {
    const file = fs.readFileSync(path, "utf-8");
    let result;

    const fileExpression = new RegExp(expression, flags ? flags : undefined);
    result = fileExpression.test(file);

    if (failIfNotFound && !result) {
      throw new Error("Not found any matches.");
    }

    return result;
  } catch (e) {
    log.err(e);
    process.exit(1);
  }
}
export function replaceStringInFile() {
  // Replace string in file finding by string or regular expression
  log.debug("Started Replace String In File Plugin");
  const {
    path,
    expression,
    replaceString,
    flags,
    failIfNotFound = false,
  } = params;

  this.replaceStringInFileWithProps(
    path,
    expression,
    replaceString,
    flags,
    failIfNotFound
  );

  log.debug("Finished Replace String In File Plugin");
}
export function replaceStringInFileWithProps(
  path,
  expression,
  replaceString,
  flags,
  failIfNotFound
) {
  try {
    const file = fs.readFileSync(path, "utf-8");
    let result;

    const fileExpression = new RegExp(expression, flags ? flags : undefined);
    if (failIfNotFound && !fileExpression.test(file))
      throw new Error("Not found any matches.");
    result = file.replace(fileExpression, replaceString);

    fs.writeFileSync(path, result, "utf-8");
    log.good("The string has been replaced!");
  } catch (e) {
    log.err(e);
    process.exit(1);
  }
}
export function replaceTokensInFile() {
  // Replace tokens in files
  log.debug("Started Replace Tokens in File Plugin");
  const {
    path,
    files,
    tokenStartDelimiter, // need to use double escape "\\" before special characters like "$", otherwise the regex search will fail
    tokenEndDelimiter,
    replaceTokenMap,
    filenameSearchFlags = "g",
    tokenSearchFlags = "g",
    failIfNotFound = false,
  } = params;

  this.replaceTokensInFileWithProps(
    path,
    files,
    tokenStartDelimiter,
    tokenEndDelimiter,
    replaceTokenMap,
    filenameSearchFlags,
    tokenSearchFlags,
    failIfNotFound
  );

  log.debug("Finished Replace Tokens in File Plugin");
}
export function replaceTokensInFileWithProps(
  path,
  files,
  tokenStartDelimiter,
  tokenEndDelimiter,
  replaceTokenMap,
  filenameSearchFlags,
  tokenSearchFlags,
  failIfNotFound
) {
  const testFilename = (file, fileName) => {
    let expression;
    if (file.startsWith("/") && file.lastIndexOf("/") > 0) {
      const lastSlash = file.lastIndexOf("/");
      expression = new RegExp(
        file.slice(1, lastSlash),
        file.slice(lastSlash + 1)
      );
    } else {
      expression = new RegExp(file, filenameSearchFlags);
    }
    return expression.test(fileName);
  };

  try {
    const allFileNames = fs.readdirSync(path);
    log.debug("Files in Path: ", allFileNames);
    let replaceFileNames = [];
    if (Array.isArray(files)) {
      allFileNames.forEach((fileName) =>
        files.forEach((file) => {
          if (testFilename(file, fileName)) {
            replaceFileNames.push(fileName);
          }
        })
      );
    } else {
      allFileNames.forEach((fileName) => {
        if (testFilename(files, fileName)) {
          replaceFileNames.push(fileName);
        }
      });
    }
    log.debug("All matching files: ", replaceFileNames);

    if (failIfNotFound && replaceFileNames.length === 0)
      throw new Error("Not found any matches.");

    const allFilePaths = replaceFileNames.map((fileName) =>
      filePath.join(path, fileName)
    );
    const allFileContents = allFilePaths.map((fileDir) =>
      fs.readFileSync(fileDir, "utf-8")
    );

    const newFileContents = allFileContents.map((fileContent) => {
      let file = fileContent;
      Object.keys(replaceTokenMap).forEach((tokenKey) => {
        const expression = new RegExp(
          `(${tokenStartDelimiter})(${tokenKey})(${tokenEndDelimiter})`,
          tokenSearchFlags
        );
        file = file.replace(expression, replaceTokenMap[tokenKey]);
      });
      return file;
    });

    allFilePaths.forEach((fileDir, index) => {
      fs.writeFileSync(fileDir, newFileContents[index], "utf-8");
    });

    return allFilePaths;
  } catch (e) {
    log.err(e);
    process.exit(1);
  }
}
