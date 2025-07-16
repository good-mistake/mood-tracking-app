"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import Image from "next/image";
import { login } from "../redux/user";
import Lottie from "lottie-react";
import Loadings from "../Loadings.json";
import LoadingBtn from "../LoadingBtn.json";

const Page = () => {
  const route = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      setSuccess("Log In successful,Redirecting...");

      if (result.user?.isOnboarded) {
        setTimeout(() => {
          route.push("/");
        }, 500);
      } else {
        setTimeout(() => {
          route.push("/onBoarding");
        }, 500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => setisLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loadings">
        <div>
          <Lottie animationData={Loadings} loop={true} />
        </div>
      </div>
    );
  }
  return (
    <div className="loginAndSignup">
      <main>
        <Image
          src={`/assets/images/logo.svg`}
          width={177}
          height={60}
          alt="logo"
        />
        <form onSubmit={handleLogin}>
          <h3>Welcome back!</h3>
          <h6> Log in to continue tracking your mood and sleep.</h6>
          <label htmlFor="email">
            <p>Email address</p>
            <input
              type="email"
              placeholder="name@mail.com"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>{" "}
          <label htmlFor="Password">
            <p>Password</p>
            <input
              type="password"
              id="Password"
              name="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <h6 className="error">Something happend. Please try again.</h6>
          )}{" "}
          {success && <h6 className="success">{success}</h6>}
          <button type="submit" disabled={loading}>
            {loading ? (
              <Lottie animationData={LoadingBtn} loop={true} />
            ) : (
              "Log In"
            )}
          </button>
          <h6>
            {"Haven't got an account?"}{" "}
            <span onClick={() => route.push(`/signup`)}>Sign up.</span>
          </h6>
        </form>
      </main>
    </div>
  );
};

export default Page;
