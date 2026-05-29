// "use client";
// import { useEffect, useState } from "react";

// export default function Counter({ end, suffix = "" }) {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let start = 0;
//     const duration = 800;
//     const stepTime = 20;
//     const totalSteps = duration / stepTime;
//     const increment = Math.ceil(end / totalSteps);

//     const interval = setInterval(() => {
//       start += increment;
//       if (start >= end) {
//         setCount(end);
//         clearInterval(interval);
//       } else {
//         setCount(start);
//       }
//     }, stepTime);

//     return () => clearInterval(interval);
//   }, [end]);

//   // format number (8000 → 8K)
//   const display =
//     end >= 1000 && count === end
//       ? `${Math.floor(end / 1000)}K${suffix}`
//       : count;

//   return (
//     <h1 className="font-bold text-4xl mb-1">
//       {display}
//     </h1>
//   );
// }



"use client";
import { useEffect, useState } from "react";

type CounterProps = {
  end: number;
  suffix?: string;
};

export default function Counter({ end, suffix = "" }: CounterProps) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = Math.ceil(end / totalSteps);

    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [end]);

  const display =
    end >= 1000 && count === end
      ? `${Math.floor(end / 1000)}K${suffix}`
      : count;

  return (
    <div className="font-bold text-4xl mb-1">
      {display}
    </div>
  );
}
