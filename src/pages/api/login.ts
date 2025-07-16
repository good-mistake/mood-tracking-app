import connectDb from "../../app/utils/connectDb";
import User from "../../../models/userSchema";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  await connectDb();
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        isOnboarded: user.isOnboarded,
        profilePic: user.profilePic,
        moodEntries: user.moodEntries,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Login failed" });
  }
}
