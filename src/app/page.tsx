"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import MoodSleepChart from "./components/MoodSleepChart";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "./redux/store";
import data from "../../data.json";
import Lottie from "lottie-react";
import LogMood from "./components/LogMood";
import { logout } from "./redux/user";
import Loadings from "./Loadings.json";
import LastFeeling from "./components/LastFeeling";
import Settings from "./components/Settings";
import { setGuestProfile } from "./redux/user";
import { setInitialGuestMoodEntries } from "./redux/moodSlice";
import { useRouter } from "next/navigation";
import { fetchUserFromToken } from "./redux/user";

export default function Home() {
  const user = useSelector((state: RootState) => state.user.user);
  const fullName = useSelector((state: RootState) => state.user.user?.fullName);
  const email = useSelector((state: RootState) => state.user.user?.email);
  const [isLoading, setIsLoading] = useState(true);
  const enteries = useSelector((state: RootState) => state.mood.entries);
  const route = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const date = new Date(Date.now());
  const [useMood, setUseMood] = useState("");
  const [onBoarding, setOnboarding] = useState(false);
  type MoodKey = keyof typeof moodConfig;
  const isValidMood = (mood: string): mood is MoodKey => mood in moodConfig;
  const name = fullName?.split(" ")[0] ?? "";

  const [openSetting, setOpenSetting] = useState(false);
  const guestMoodEntries = useSelector(
    (state: RootState) => state.user.user?.moodEntries
  );
  const [logMood, setLogMood] = useState(false);
  const dispatch = useAppDispatch();
  const today = new Date().toDateString();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const initialize = async () => {
      if (token) {
        await dispatch(fetchUserFromToken(token));
      } else if (!token) {
        dispatch(
          setGuestProfile({
            fullName: "Lisa Maria",
            profilePic: "/assets/images/avatar-lisa.jpg",
            name: name,
            moodEntries: data.moodEntries,
            email: "lisa@mail.com",
            isGuest: true,
          })
        );
        dispatch(setInitialGuestMoodEntries(data.moodEntries || []));
      }
      setIsLoading(false);
    };

    initialize();

    const now = new Date();
    const millisTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const timeout = setTimeout(() => {
      window.location.reload();
    }, millisTillMidnight);

    return () => clearTimeout(timeout);
  }, [dispatch, name]);

  const moodConfig = {
    veryHappy: {
      icon: "/assets/images/icon-very-happy-white.svg",
      label: "Very Happy",
      alt: "very happy",
    },
    Happy: {
      icon: "/assets/images/icon-happy-white.svg",
      label: "Happy",
      alt: "happy",
    },
    Neutral: {
      icon: "/assets/images/icon-neutral-white.svg",
      label: "Neutral",
      alt: "neutral",
    },
    Sad: {
      icon: "/assets/images/icon-sad-white.svg",
      label: "Sad",
      alt: "sad",
    },
    VerySad: {
      icon: "/assets/images/icon-very-sad-white.svg",
      label: "Very Sad",
      alt: "very sad",
    },
  };

  const moodEntries = token
    ? user?.moodEntries || []
    : enteries || guestMoodEntries || [];
  const hasLoggedToday = moodEntries?.some((entry) => {
    return new Date(entry.createdAt).toDateString() === today;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOnboarding(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sorted = [...moodEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const lastFive = sorted.slice(0, 5);

  const isEnough = lastFive.length === 5;
  const lastEntry = moodEntries[moodEntries.length - 1];

  const avgMood = isEnough
    ? lastFive.reduce((sum, entry) => sum + entry.mood, 0) / 5
    : 0;

  const avgSleep = isEnough
    ? lastFive.reduce((sum, entry) => sum + entry.sleepHours, 0) / 5
    : 0;

  const previousFour = isEnough ? lastFive.slice(0, 4) : [];

  const prevAvgMood =
    previousFour.length === 4
      ? previousFour.reduce((sum, e) => sum + e.mood, 0) / 4
      : 0;

  const prevAvgSleep =
    previousFour.length === 4
      ? previousFour.reduce((sum, e) => sum + e.sleepHours, 0) / 4
      : 0;

  const moodDiff = lastEntry?.mood - prevAvgMood;
  const sleepDiff = lastEntry?.sleepHours - prevAvgSleep;

  useEffect(() => {
    if (avgMood >= 2) {
      setUseMood("VeryHappy");
    } else if (avgMood >= 0.6 && avgMood <= 1.9) {
      setUseMood("Happy");
    } else if (avgMood > -0.6 && avgMood < 0.6) {
      setUseMood("Neutral");
    } else if (avgMood <= -0.6 && avgMood >= -1.9) {
      setUseMood("Sad");
    } else if (avgMood < -1.9) {
      setUseMood("VerySad");
    } else {
      setUseMood("");
    }
  }, [avgMood]);
  const moodTrend =
    previousFour.length === 4
      ? moodDiff > 0.6
        ? "increase"
        : moodDiff < -0.6
        ? "decrease"
        : "same"
      : null;

  const sleepTrend =
    previousFour.length === 4
      ? sleepDiff > 0.6
        ? "increase"
        : sleepDiff < -0.6
        ? "decrease"
        : "same"
      : null;
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
    <div className="moodContainer">
      <main className="">
        <header>
          <Image
            src={`/assets/images/logo.svg`}
            alt="logo"
            width={177}
            height={40}
          />
          <div ref={ref}>
            <Image
              src={`${
                user ? user.profilePic : "/assets/images/avatar-lisa.jpg"
              }`}
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
              alt="profile img"
              onClick={() => setOnboarding((prev) => !prev)}
            />
            <Image
              src={`/assets/images/icon-dropdown-arrow.svg`}
              alt="logo"
              width={10}
              height={6}
              onClick={() => setOnboarding((prev) => !prev)}
            />
            <div ref={ref} className={onBoarding ? "active" : "notActive"}>
              <div>
                <div>
                  <p>{fullName}</p>
                  <p>{email}</p>
                </div>

                <div>
                  <button onClick={() => setOpenSetting((prev) => !prev)}>
                    <Image
                      src={`/assets/images/icon-settings.svg`}
                      alt="logo"
                      width={16}
                      height={16}
                      onClick={() => setOnboarding((prev) => !prev)}
                    />
                    <p>Settings</p>
                  </button>
                  {user?.isGuest ? (
                    <button onClick={() => route.push("/login")}>
                      <Image
                        src={`/assets/images/icon-logout.svg`}
                        alt="login"
                        width={16}
                        height={16}
                        onClick={() => setOnboarding((prev) => !prev)}
                      />
                      <p>Login</p>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(logout({ token: true }));
                        route.push("/");
                      }}
                    >
                      <Image
                        src={`/assets/images/icon-logout.svg`}
                        alt="logout"
                        width={16}
                        height={16}
                        onClick={() => setOnboarding((prev) => !prev)}
                        style={{
                          rotate: `180deg`,
                        }}
                      />
                      <p>Logout</p>
                    </button>
                  )}
                </div>
              </div>
            </div>{" "}
          </div>
        </header>
        <Settings
          openSetting={openSetting}
          setOpenSetting={setOpenSetting}
          user={user}
        />
        <section className="nameAndDate">
          <h2>Hello, {name}!</h2>
          <h1>How are you feeling today?</h1>
          <p>{formattedDate}</p>
          {!hasLoggedToday && (
            <button
              onClick={() => setLogMood((prev) => !prev)}
            >{`Log today's mood`}</button>
          )}
          <LogMood
            logMood={logMood}
            enteries={moodEntries}
            setLogMood={setLogMood}
            user={user}
          />
        </section>
        <section className="lastFeel">
          <LastFeeling hasLoggedToday={hasLoggedToday} data={data} />
        </section>
        <section className="content">
          <div className="left">
            {user?.moodEntries && isEnough ? (
              <>
                <div>
                  <h4>
                    Average Mood <span>(Last 5 Check-ins)</span>
                  </h4>
                  <div
                    className={
                      useMood === `veryHappy`
                        ? `veryHappy`
                        : useMood === `Happy`
                        ? "Happy"
                        : useMood === `Neutral`
                        ? "Neutral"
                        : useMood === "Sad"
                        ? "Sad"
                        : useMood === "VerySad"
                        ? "VerySad"
                        : ""
                    }
                  >
                    {useMood && isValidMood(useMood) ? (
                      <h3>
                        <Image
                          src={moodConfig[useMood].icon}
                          alt={moodConfig[useMood].alt}
                          width={24}
                          height={24}
                        />{" "}
                        {moodConfig[useMood].label}
                      </h3>
                    ) : (
                      <h3>Keep tracking!</h3>
                    )}
                    {moodTrend === "increase" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-increase.svg"
                          alt="mood"
                          width={15}
                          height={16}
                        />
                        Increase from the previous 5 check-ins
                      </p>
                    ) : moodTrend === "decrease" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-decrease.svg"
                          alt="mood"
                          width={15}
                          height={16}
                        />
                        Decrease from the previous 5 check-ins
                      </p>
                    ) : moodTrend === "same" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-same.svg"
                          alt="mood"
                          width={15}
                          height={16}
                        />
                        Same as the previous 5 check-ins
                      </p>
                    ) : (
                      <p>Log 5 check-ins to see your average mood.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4>
                    Average Sleep <span>(Last 5 Check-ins)</span>
                  </h4>
                  <div className={avgSleep ? "sleep" : ""}>
                    <h3>
                      {Number.isFinite(avgSleep) && (
                        <Image
                          src={`/assets/images/icon-sleep.svg`}
                          alt="sleep"
                          width={24}
                          height={24}
                        />
                      )}
                      {avgSleep >= 9
                        ? `9+ hours`
                        : avgSleep >= 7 && avgSleep <= 9
                        ? "7-8 hours"
                        : avgSleep >= 5 && avgSleep <= 7
                        ? "5-6 hours"
                        : avgSleep >= 3 && avgSleep <= 5
                        ? "3-4 hours"
                        : avgSleep >= 0 && avgSleep <= 3
                        ? `0-2 hours`
                        : "Track 5 nights to view average sleep."}
                    </h3>
                    {sleepTrend === "increase" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-increase.svg"
                          alt="sleep"
                          width={15}
                          height={16}
                        />
                        Increase from the previous 5 check-ins
                      </p>
                    ) : sleepTrend === "decrease" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-decrease.svg"
                          alt="sleep"
                          width={15}
                          height={16}
                        />
                        Decrease from the previous 5 check-ins
                      </p>
                    ) : sleepTrend === "same" ? (
                      <p>
                        <Image
                          src="/assets/images/icon-trend-same.svg"
                          alt="sleep"
                          width={15}
                          height={16}
                        />
                        Same as the previous 5 check-ins
                      </p>
                    ) : (
                      <p>Track 5 nights to view average sleep.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4>
                    Average Mood <span>(Last 5 Check-ins)</span>
                  </h4>
                  <div>
                    <h3>Keep tracking!</h3>
                    <p>Log 5 check-ins to see your average mood.</p>
                  </div>
                </div>
                <div>
                  <h4>
                    Average Sleep <span>(Last 5 Check-ins)</span>
                  </h4>
                  <div>
                    <h3>Not enough data yet!</h3>
                    <p>Track 5 nights to view average sleep.</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="right">
            <MoodSleepChart />
          </div>
        </section>
      </main>
    </div>
  );
}
