"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import Image from "next/image";
import { updateUserProfile } from "../redux/user";
import Lottie from "lottie-react";
import Loadings from "../Loadings.json";
import LoadingBtn from "../LoadingBtn.json";
const Page = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const route = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState("");
  const [previewPic, setPreviewPic] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isLoading, setisLoading] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewPic(localUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/imgUpload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedUrl(data.secure_url);
    } catch {
      setError("Image upload failed");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    if (!name.trim()) {
      setError("Please fill your name");
      setLoading(false);
      return;
    }
    const finalProfilePic =
      uploadedUrl || previewPic || "/assets/images/avatar-placeholder.svg";
    try {
      dispatch(updateUserProfile({ fullName: name, profilePic: uploadedUrl }));

      const token = localStorage.getItem("token");
      await axios.patch(
        "/api/user/onboarded",
        {
          fullName: name,
          profilePic: finalProfilePic,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(updateUserProfile({ isOnboarded: true }));

      setSuccess("Successful, Redirecting...");
      setTimeout(() => {
        route.push("/");
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
        <div className="onBoardingContainer">
          <section className="top">
            <h3>Personalize your experience</h3>
            <h6>Add your name and a profile picture to make Mood yours.</h6>
          </section>
          <section className="mid">
            <label htmlFor="name">
              <p>Name</p>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Jane Appleseed"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div>
              <Image
                src={
                  previewPic.trim() !== ""
                    ? previewPic
                    : "/assets/images/avatar-placeholder.svg"
                }
                alt="profile pic"
                width={64}
                height={64}
                style={{ borderRadius: "50%" }}
              />{" "}
              <input
                type="file"
                accept="image/*"
                id="fileInput"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <div>
                <h6>Upload Image</h6>
                <p>Max 250KB, PNG or JPEG</p>
                <button
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="uploadImg"
                >
                  Upload
                </button>
              </div>
            </div>
          </section>{" "}
          {error && <h6 className="error">{error}</h6>}{" "}
          {success && <h6 className="success">{success}</h6>}
          <button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Lottie animationData={LoadingBtn} loop={true} />
            ) : (
              "Start Tracking"
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Page;
