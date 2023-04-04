import { Request, RequestHandler } from "express";
import multer from "multer";

export const multipleFilesUpload: RequestHandler = multer().fields([{ name: "file" }]);

export function extractUploadFiles(req: Request): Express.Multer.File[] {
  const files = req.files;
  if (!files || Array.isArray(files)) {
    return files ?? [];
  } else {
    return Object.values(files).flat();
  }
}

export function extractJsonBody<T>(req: Request): T | undefined {
  return JSON.parse(req.body?.json) as T;
}
