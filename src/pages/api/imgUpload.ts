import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = new IncomingForm();

  form.parse(req, async (err: Error, fields: Fields, files: Files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Form parsing failed" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || !file.filepath) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "profile-pics",
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Upload to Cloudinary failed" });
    } finally {
      fs.unlink(file.filepath, () => {});
    }
  });
}
