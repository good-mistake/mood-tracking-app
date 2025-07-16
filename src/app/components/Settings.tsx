import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { updateUserProfile, setGuestProfile } from "../redux/user";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import axios from "axios";
import Lottie from "lottie-react";
import LoadingBtn from "../LoadingBtn.json";

interface SettingsProps {
  openSetting: boolean;
  setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
  user: {
    isGuest?: boolean;
  } | null;
}

const Settings: React.FC<SettingsProps> = ({
  openSetting,
  setOpenSetting,
  user,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fullName = useSelector(
    (state: RootState) => state.user.user?.fullName ?? ""
  );
  const profilePic = useSelector(
    (state: RootState) => state.user.user?.profilePic
  );
  const [previewPic, setPreviewPic] = useState<string | null>(
    profilePic ?? null
  );
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (openSetting) {
      setName(fullName || "");
      setPreviewPic(profilePic || null);
    }
  }, [openSetting, fullName, profilePic]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    const token = localStorage.getItem("token");

    const existingPic = profilePic || "";
    let finalProfilePic =
      uploadedUrl ||
      (profilePic ? existingPic : "/assets/images/avatar-placeholder.svg");

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/imgUpload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setUploadedUrl(data.secure_url);
        finalProfilePic = data.secure_url;

        if (user) {
          dispatch(
            updateUserProfile({ fullName, profilePic: data.secure_url })
          );
        } else {
          dispatch(setGuestProfile({ profilePic: data.secure_url }));
        }
      }

      if (!name.trim()) {
        setError("Please fill your name");
        setLoading(false);
        return;
      }

      if (!token) {
        dispatch(
          setGuestProfile({
            fullName: name,
            name: fullName?.split(" ")[0] ?? "",
            profilePic: finalProfilePic,
          })
        );
      } else {
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

        dispatch(
          updateUserProfile({
            fullName: name,
            profilePic: finalProfilePic,
            isOnboarded: true,
          })
        );
      }

      setSuccess("Successful, Redirecting...");
      setOpenSetting(false);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewPic(localUrl);
    setSelectedFile(file);
  };

  const resetForm = () => {
    setPreviewPic(profilePic ?? null);
    setName(fullName || "");
    setError("");
    setLoading(false);
    setSuccess("");
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpenSetting(false);
        resetForm();
      }
    };

    if (openSetting) {
      document.addEventListener("mousedown", handleClickOutside);
      resetForm();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSetting]);
  return (
    <div
      className={`overlay ${
        openSetting ? "openSettingOverlayactive" : "openSettingOverlayinactive"
      }`}
    >
      <div
        ref={modalRef}
        className={`${openSetting ? "logMoodactive" : "logMoodinactive"} modal`}
      >
        <div
          onClick={() => {
            setOpenSetting(false);
            resetForm();
          }}
        >
          x
        </div>
        <section className="top">
          <h3>Update your profile</h3>
          <h6>Personalize your account with your name and photo.</h6>
        </section>
        <section className="mid">
          <label htmlFor="name">
            <p>name</p>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </label>
          <div>
            <Image
              src={
                typeof previewPic === "string" && previewPic.trim() !== ""
                  ? previewPic
                  : typeof profilePic === "string" && profilePic.trim() !== ""
                  ? profilePic
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
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
