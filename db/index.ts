import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

const writeFile = <T>(path: string, data: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const readFile = (path: string) => {
  // Check if file exists;
  if (!fs.existsSync(path)) {
    return Promise.reject("DATA NOT FOUND");
  }
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data.toString()));
      }
    });
  });
};

const readdir = (path: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

if (!fs.existsSync(path.join(path.resolve(__dirname), "files"))) {
  fs.mkdirSync(path.join(path.resolve(__dirname), "files"));
}

class Database<Schema> {
  private schemaName: string;
  private dbPath: string;

  constructor(name: string) {
    this.schemaName = name;
    const validPath = name.toLowerCase().replace(" ", "_");
    this.dbPath = path.join(path.resolve(__dirname), "files", validPath);
    // If folder with this name doesn't exist, create one.
    // If folder exists well and good.
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath);
    }
  }

  async create(data: Schema) {
    const _id = uuid();
    const dataWithId = { ...data, _id };
    const filePath = path.join(this.dbPath, `${_id}.json`);

    // Write to JSON files
    return writeFile(filePath, dataWithId);
  }

  async findById(id: string) {
    const filePath = path.join(this.dbPath, `${id}.json`);

    return readFile(filePath) as Promise<Schema & { _id: string }>;
  }

  private getIdFromFileName(fileName: string) {
    // UUID is always 36 characters long
    return fileName.substr(0, 36);
  }

  async getAllDocuments() {
    const fileNames = await readdir(this.dbPath);
    const docIds = fileNames.map(this.getIdFromFileName);
    return Promise.all(docIds.map(this.findById));
  }
}

export default Database;
