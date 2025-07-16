import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectDb from "@/app/utils/connectDb";
import userSchema from "../../../models/userSchema";

const getUserFromToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    return decoded.id;
  } catch (error) {
    console.error(error);
    throw new Error("Invalid token");
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end("Method not Allowed.");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    await connectDb();
    const userId = getUserFromToken(token);
    const user = await userSchema.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
}
