"use client";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import moodEmojiMap from "../utils/moodEmojiMap";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
const getBarColor = (mood: number) => {
  if (mood >= 2) return "#FFC97C";
  if (mood === 1) return "#89E780";
  if (mood === 0) return "#89CAFF";
  if (mood === -1) return "#B8B1FF";
  if (mood <= -2) return "#FF9B99";
  return "#D3D3D3";
};
const getHeightFromSleep = (hours: number) => {
  if (hours >= 9) return 299;
  if (hours >= 7 && hours <= 9) return 214;
  if (hours >= 5 && hours <= 7) return 165;
  if (hours >= 3 && hours <= 5) return 104;
  if (hours >= 0 && hours <= 3) return 60;
  return 0;
};

export default function MoodSleepManualChart() {
  const user = useSelector((state: RootState) => state.user.user);
  const guestMoodEntries = useSelector(
    (state: RootState) => state.user.user?.moodEntries
  );
  const token = localStorage.getItem("token");

  const guestEnteries = useSelector((state: RootState) => state.mood.entries);
  const enteries = token
    ? user?.moodEntries || []
    : guestEnteries || guestMoodEntries || [];
  const allEntries = enteries;
  const sortedEntries = [...allEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  console.log(enteries);
  let last11Days: Date[];

  if (token) {
    last11Days = Array.from({ length: 11 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (10 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });
  } else {
    const entryDatesSet = new Set(
      enteries.map((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    if (!token) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
    }

    const sortedEntryDates = Array.from(entryDatesSet)
      .map((ts) => new Date(ts))
      .sort((a, b) => a.getTime() - b.getTime());

    last11Days = sortedEntryDates.slice(-11);
  }
  const moodEntries = last11Days.map((date) => {
    const entry = sortedEntries.find(
      (e) => new Date(e.createdAt).toDateString() === date.toDateString()
    );
    return {
      ...entry,
      createdAt: date.toISOString(),
      isEmpty: !entry,
    };
  });
  const xAxisDates = Array.from({ length: 11 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (10 - i));
    return date;
  });

  return (
    <div className="chartContainer">
      <h2 className="text-2xl font-semibold mb-6">Mood and sleep trends</h2>

      <div className="charts">
        <div className="hours">
          <div>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={9}
              height={10}
            />
            <p>9+ hours</p>
          </div>
          <div>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={9}
              height={10}
            />
            <p>7-8 hours</p>
          </div>
          <div>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={9}
              height={10}
            />
            <p>5-6 hours</p>{" "}
          </div>
          <div>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={9}
              height={10}
            />
            <p>3-4 hours</p>{" "}
          </div>
          <div>
            <Image
              src={`/assets/images/icon-sleep.svg`}
              alt="sleep"
              width={9}
              height={10}
            />{" "}
            <p>0-2 hours</p>
          </div>
        </div>

        <div className="moodDates">
          {moodEntries.length > 0
            ? moodEntries.map((entry, i) => {
                const heightPx =
                  entry?.sleepHours ?? 0 > 0
                    ? getHeightFromSleep(entry?.sleepHours ?? 0)
                    : 0;
                const moodValue = entry.mood as -2 | -1 | 0 | 1 | 2;
                return (
                  <div key={i}>
                    {allEntries ? (
                      <div
                        style={{
                          backgroundColor: getBarColor(entry?.mood ?? 0),
                          height: `${heightPx}px`,
                          transition: "height 0.3s ease",
                        }}
                        title={`${entry.sleepHours} hours`}
                      >
                        <div>{moodEmojiMap[moodValue]}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    <p>
                      {format(parseISO(entry.createdAt), "MMMM")}
                      <span>{format(parseISO(entry.createdAt), "dd")} </span>
                    </p>
                  </div>
                );
              })
            : xAxisDates.map((date, i) => (
                <div key={i}>
                  <p>
                    {format(date, "MMMM")}
                    <span>{format(date, "dd")} </span>
                  </p>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
