import connectDb from "../../../app/utils/connectDb";
import User from "../../../../models/userSchema";
import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH")
    return res.status(405).json({ message: "Method Not Allowed" });

  await connectDb();
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
    const { fullName, profilePic } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "fullName is required" });
    }
    const name = fullName.split(" ")[0] || "";

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { isOnboarded: true, fullName, name, profilePic },
      { new: true }
    );
    res.status(200).json({ message: "Onboarding complete", user });
  } catch (err) {
    console.error("Error in onboarding PATCH:", err);
    res.status(500).json({ message: "Failed to update onboarding status" });
  }
}
