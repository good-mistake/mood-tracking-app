"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import Image from "next/image";
import Lottie from "lottie-react";
import Loadings from "../Loadings.json";
import LoadingBtn from "../LoadingBtn.json";
import axios from "axios";
import { signup } from "../redux/user";
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await dispatch(signup({ email, password })).unwrap();
      setSuccess("Sign up successful,Redirecting...");
      setTimeout(() => {
        route.push("/login");
      }, 500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Something went wrong.";
        setError(message);
      } else if (err instanceof Error) {
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
        <form onSubmit={handleSignup}>
          <h3>Create an account</h3>
          <h6>Join to track your daily mood and sleep with ease.</h6>
          <label htmlFor="email">
            <p>Email address</p>
            <input
              type="email"
              placeholder="name@mail.com"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              name="email"
            />
          </label>{" "}
          <label htmlFor="Password">
            <p>Password</p>
            <input
              type="password"
              id="Password"
              name="Password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>{" "}
          {error && <h6 className="error">{error}</h6>}{" "}
          {success && <h6 className="success">{success}</h6>}
          <button type="submit" disabled={loading}>
            {loading ? (
              <Lottie animationData={LoadingBtn} loop={true} />
            ) : (
              "Sign Up"
            )}
          </button>
          <h6>
            Already got an account?
            <span onClick={() => route.push(`/login`)}>Log in.</span>
          </h6>
        </form>
      </main>
    </div>
  );
};

export default Page;
