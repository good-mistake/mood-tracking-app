"use client";
import { useState } from "react";
import Image from "next/image";
const UploadImg = () => {
  const [url, setUrl] = useState("");
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/imgUpload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUrl(data.secure_url);
  };
  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {url && <Image src={url} alt="Uploaded" className="mt-4 w-64" />}
    </div>
  );
};

export default UploadImg;
