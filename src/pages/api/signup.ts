import connectDb from "../../app/utils/connectDb";
import User from "../../../models/userSchema";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  await connectDb();
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      isOnboarded: false,
      moodEntries: [],
    });
    return res
      .status(201)
      .json({ message: "User created", user: { email: newUser.email } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Signup failed" });
  }
}
