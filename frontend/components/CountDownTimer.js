import React, { useEffect, useState } from "react";

// CountdownTimer component (only re-renders itself every second)
function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate - now;

      if (diff <= 0) {
        setTimeLeft("Deadline passed, but you can still submit.");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        timeString += `${hours.toString().padStart(2, "0")}h `;
        timeString += `${minutes.toString().padStart(2, "0")}m `;
        timeString += `${seconds.toString().padStart(2, "0")}s`;

        setTimeLeft(`Time left: ${timeString}`);
      }
    };

    updateCountdown();

    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [deadline]);

  return (
    <p
      className="
      mt-1
      text-red-600
      font-semibold
      text-lg
      tracking-wide
      bg-gradient-to-r from-red-400 via-red-500 to-red-600
      bg-clip-text
      drop-shadow-md
      select-none
      transition-colors
      duration-300
      ease-in-out
      aria-live-politeness
    "
      aria-live="polite"
    >
      {timeLeft}
    </p>
  );
}

export default CountdownTimer;
