import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
interface MoodQuotes {
  [key: number]: string[];
}

interface Props {
  hasLoggedToday: boolean;
  data: { moodQuotes: MoodQuotes };
}

const moodMap = {
  VerySad: -2,
  Sad: -1,
  Neutral: 0,
  Happy: 1,
  VeryHappy: 2,
  "no mood yet": 12133,
} as const;
type MoodLabel = keyof typeof moodMap;

const LastFeeling: React.FC<Props> = ({ hasLoggedToday, data }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const guestMoodEntries = useSelector(
    (state: RootState) => state.user.user?.moodEntries
  );
  const token = localStorage.getItem("token");

  const guestEnteries = useSelector((state: RootState) => state.mood.entries);
  const moodEntries = token
    ? user?.moodEntries || []
    : guestEnteries || guestMoodEntries || [];
  const lastEntry = moodEntries[moodEntries.length - 1];

  const [useMood, setUseMood] = useState<MoodLabel | "">("");
  const [quote, setQuote] = useState("");
  const [sleep, setSleep] = useState("");
  const { moodQuotes } = data;
  useEffect(() => {
    if (!lastEntry || !moodQuotes) return;

    let moodLabel: MoodLabel = "Neutral";
    if (lastEntry.mood >= 2) {
      moodLabel = "VeryHappy";
    } else if (lastEntry.mood >= 0.6 && lastEntry.mood <= 1.9) {
      moodLabel = "Happy";
    } else if (lastEntry.mood > -0.6 && lastEntry.mood < 0.6) {
      moodLabel = "Neutral";
    } else if (lastEntry.mood <= -0.6 && lastEntry.mood >= -1.9) {
      moodLabel = "Sad";
    } else if (lastEntry.mood < -1.9) {
      moodLabel = "VerySad";
    } else {
      moodLabel = "no mood yet";
    }

    const getSleepLabel = (hours: number): string => {
      if (hours >= 9) return "9+ hours";
      if (hours >= 7) return "7-8 hours";
      if (hours >= 5) return "5-6 hours";
      if (hours >= 3) return "3-4 hours";
      if (hours >= 0) return "0-2 hours";
      return "0";
    };
    const label = getSleepLabel(lastEntry.sleepHours);
    setSleep(label);

    setUseMood(moodLabel);
    const moodValue = moodMap[moodLabel];
    const quotes = moodQuotes[moodValue];
    if (quotes?.length) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }
  }, [lastEntry, moodQuotes]);
  return (
    <div className={`lastEntry ${hasLoggedToday ? "show" : "hide"}`}>
      <div className="left">
        <h2>
          <span>I’m feeling</span>
          {useMood.replace(/([a-z])([A-Z])/g, "$1 $2") || ""}{" "}
        </h2>
        {useMood && (
          <Image
            src={`/assets/images/icon-${useMood
              .replace(/^Very(?=[A-Z])/, "Very-")
              .toLowerCase()}-color.svg`}
            alt={useMood}
            width={38}
            height={38}
          />
        )}
        <p>
          <Image
            src={`/assets/images/icon-quote.svg`}
            alt="quote"
            width={24}
            height={21}
          />
          “{quote}”
        </p>
      </div>
      <div className="right">
        <section className="hour">
          <p>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={22}
              height={22}
            />
            Sleep
          </p>
          <h3>{sleep}</h3>
        </section>
        <section className="reflection">
          <p>
            <Image
              src={`/assets/images/icon-reflection.svg`}
              alt="Reflection"
              width={22}
              height={22}
            />
            Reflection of the day
          </p>
          <h6>{lastEntry?.journalEntry}</h6>
          <ul>
            {lastEntry?.feelings.map((feeling, i) => (
              <li key={i}>#{feeling}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default LastFeeling;
