import fs from "fs";

export function getFormattedTime() {
  const today = new Date();
  const y = today.getFullYear();
  // JavaScript months are 0-based.
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const h = today.getHours();
  const mi = today.getMinutes();
  const s = today.getSeconds();
  return y + "-" + m + "-" + d + " | " + h + ":" + mi + ":" + s;
}

export function getFileStream(
  suffix: string,
  extension: string = "xls",
  addDateSubfolder: boolean = false
): fs.WriteStream {
  const FOLDER_NAME = `data`;
  const SUBFOLDER_NAME = `${getFormattedTime()}`;
  const FILE_NAME = `./${FOLDER_NAME}/${SUBFOLDER_NAME}/${suffix
    .trim()
    .replace(/ /g, "-")
    .toLowerCase()}.${extension}`;

  const validateFolder = folderName => {
    if (!fs.existsSync(folderName)) {
      // Make directory
      fs.mkdirSync(folderName);
    }
    return true;
  };

  // check if folder already exists?
  if (!addDateSubfolder) {
    validateFolder(FOLDER_NAME);

    return fs.createWriteStream(
      `${FOLDER_NAME}/${suffix
        .trim()
        .replace(/ /g, "-")
        .toLowerCase()}.${extension}`
    );
  } else {
    validateFolder(FOLDER_NAME);
    validateFolder(FOLDER_NAME + "/" + SUBFOLDER_NAME);
    return fs.createWriteStream(FILE_NAME);
  }
}
