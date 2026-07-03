import React, { useEffect, useRef, useState } from "react";

export default function LottiePlayer({ src, style }) {
  const ref = useRef(null);
  const [animData, setAnimData] = useState(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => setAnimData(data))
      .catch((err) => console.error("Error loading lottie:", err));
  }, [src]);

  useEffect(() => {
    let anim;
    if (animData && ref.current) {
      import("lottie-web").then((m) => {
        const lottie = m.default || m;
        anim = lottie.loadAnimation({
          container: ref.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: animData,
        });
      });
    }
    return () => {
      if (anim) anim.destroy();
    };
  }, [animData]);

  return <div ref={ref} style={style} />;
}
