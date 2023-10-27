import prisma from "@/utils/prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const { email, password } = await request.json();
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!findUser) {
      return NextResponse.json({ message: "Invalid Credentials" });
    }

    const isPasswordMatches = await compare(password, findUser.password);

    if (!isPasswordMatches) {
      return NextResponse.json({ message: "Invalid Credentials" });
    }

    const responseData = {
      id: findUser.id,
      fullName: findUser.fullName,
      address: findUser.address,
      email: findUser.email,
      phoneNumber: findUser.phoneNumber,
    };

    const accessToken = sign(responseData, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: "7d",
    });

    cookies().set("access_token", accessToken);

    return NextResponse.json({ data: responseData, message: "Login Success" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
