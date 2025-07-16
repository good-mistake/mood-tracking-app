import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { addMoodEntry } from "../redux/moodSlice";
import { useDispatch } from "react-redux";
import { MoodEntry, User } from "../utils/types";
import { updateMoodEntry } from "../redux/moodSlice";
import Lottie from "lottie-react";
import LoadingBtn from "../LoadingBtn.json";
import { updateUserMoodEntries } from "../redux/user";
interface LogMoodProps {
  logMood: boolean;
  setLogMood: (value: boolean) => void;
  enteries: MoodEntry[];
  user: User | null;
}
const LogMood: React.FC<LogMoodProps> = ({ logMood, setLogMood, user }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [mood, setMood] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [journal, setJournal] = useState("");
  const [sleep, setSleep] = useState("");
  const [loading, setLoading] = useState(false);
  const feel = [
    `Joyful`,
    "Down",
    "Anxious",
    "Calm",
    "Excited",
    "Frustrated",
    "Lonely",
    "Grateful",
    "Overwhelmed",
    "Motivated",
    "Irritable",
    "Peaceful",
    "Tired",
    "Hopeful",
    "Confident",
    "Stressed",
    "Content",
    "Disappointed",
    "Optimistic",
    "Restless",
  ];
  const resetForm = () => {
    setStep(0);
    setMood("");
    setFeelings([]);
    setJournal("");
    setSleep("");
    setError("");
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setLogMood(false);
        resetForm();
      }
    };

    if (logMood) {
      document.addEventListener("mousedown", handleClickOutside);
      resetForm();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logMood]);
  const moodMap = {
    VerySad: -2,
    Sad: -1,
    Neutral: 0,
    Happy: 1,
    VeryHappy: 2,
  };

  const sleepMap = {
    "9+ hours": 9,
    "7-8 hours": 7,
    "5-6 hours": 5,
    "3-4 hours": 3,
    "0-2 hours": 1,
  };
  type MoodKey = keyof typeof moodMap;
  type SleepKey = keyof typeof sleepMap;

  const handleContinue = async () => {
    setError("");
    if (step === 0 && !mood) return setError("Select a mood");
    if (step === 1 && feelings.length === 0)
      return setError("Pick at least 1 feeling");
    if (step === 2 && !journal.trim()) return setError("Write something");
    if (step === 3 && !sleep) return setError("Select your sleep hours");

    if (step === 3) {
      setLoading(true);
      const entry = {
        mood: moodMap[mood as MoodKey] ?? 0,
        feelings,
        journalEntry: journal,
        sleepHours: sleepMap[sleep as SleepKey] ?? 0,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      try {
        if (!user) dispatch(addMoodEntry(entry));
        else await saveEntry(entry);
        setLogMood(false);
        resetForm();
      } catch (err) {
        console.error(err);
        setError("Failed to save mood");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const toggleFeeling = (item: string) => {
    if (feelings.includes(item)) {
      setFeelings((prev) => prev.filter((f) => f !== item));
      setError("");
    } else if (feelings.length < 3) {
      setFeelings((prev) => [...prev, item]);
      setError("");
    } else {
      setError("You can select up to 3 feelings");
    }
  };

  const saveEntry = async (entry: Omit<MoodEntry, "id">) => {
    const finalEntry = {
      ...entry,
      createdAt: new Date().toISOString(),
    };
    console.log(finalEntry, "finalEntry");
    const token = localStorage.getItem("token");
    if (token) {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalEntry),
      });
      if (!res.ok) throw new Error("Failed to save mood");
      dispatch(addMoodEntry(finalEntry));
      dispatch(updateMoodEntry(finalEntry));
      dispatch(
        updateUserMoodEntries([...(user?.moodEntries ?? []), finalEntry])
      );
    } else {
      dispatch(addMoodEntry(finalEntry));
      dispatch(updateMoodEntry(finalEntry));
    }
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      setJournal(value);
    }
  };
  return (
    <div
      className={`overlay ${
        logMood ? "logMoodOverlayactive" : "logMoodOverlayinactive"
      }`}
    >
      <div
        className={`${logMood ? "logMoodactive" : "logMoodinactive"} modal`}
        ref={modalRef}
      >
        <div
          onClick={() => {
            setLogMood(false);
            resetForm();
          }}
        >
          x
        </div>
        <h2>Log your mood</h2>
        <ul className="colors">
          <li className={step === 0 ? "active" : ""}></li>
          <li className={step === 1 ? "active" : ""}></li>
          <li className={step === 2 ? "active" : ""}></li>
          <li className={step === 3 ? "active" : ""}></li>
        </ul>
        <section className={` todayMood ${step === 0 ? "active" : ""}`}>
          <h3>How was your mood today?</h3>
          <ul>
            {["VeryHappy", "Happy", "Neutral", "Sad", "VerySad"].map(
              (item, i) => (
                <li
                  key={i}
                  onClick={() => setMood(item)}
                  className={mood === item ? "active" : ""}
                >
                  <p>
                    <span className={mood === item ? "active" : ""}></span>{" "}
                    {item
                      .replace(/([A-Z])/g, " $1")
                      .replace("-", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <Image
                    src={`/assets/images/icon-${item
                      .replace(/^Very(?=[A-Z])/, "Very-")
                      .toLowerCase()}-color.svg`}
                    alt={item}
                    width={38}
                    height={38}
                  />
                </li>
              )
            )}
          </ul>
        </section>
        <section className={` feel ${step === 1 ? "active" : ""}`}>
          <div>
            <h3>How did you feel?</h3>
            <p>Select up to three tags:</p>
          </div>
          <ul>
            {feel.map((item, index) => (
              <li
                key={index}
                className={`options ${
                  feelings.includes(item) ? "selected" : ""
                }`}
                onClick={() => toggleFeeling(item)}
              >
                <span></span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className={` write ${step === 2 ? "active" : ""}`}>
          <h3>Write about your day...</h3>
          <textarea
            value={journal}
            onChange={handleJournalChange}
            placeholder="Today, I felt…"
          />
          <p className="count">{journal.length}/150</p>
        </section>
        <section className={` sleep ${step === 3 ? "active" : ""}`}>
          <h3>How many hours did you sleep last night?</h3>
          <ul>
            {[
              "9+ hours",
              "7-8 hours",
              "5-6 hours",
              "3-4 hours",
              "0-2 hours",
            ].map((hr, i) => (
              <li
                key={i}
                onClick={() => setSleep(hr)}
                className={sleep === hr ? "selected" : ""}
              >
                <p>
                  <span></span> {hr}
                </p>
              </li>
            ))}
          </ul>
        </section>
        {error && <p className="error">{error}</p>}
        <button onClick={handleContinue} disabled={loading}>
          {loading ? (
            <Lottie animationData={LoadingBtn} loop={true} />
          ) : (
            "Continue"
          )}{" "}
        </button>{" "}
      </div>
    </div>
  );
};

export default LogMood;
