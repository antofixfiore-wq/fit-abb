import React, { useRef, useState, useEffect } from "react";

const CLIPS = [
  {
    src: "https://media.base44.com/videos/public/6900e246d71384c10b97f155/fe81c592a_generated_video.mp4",
    label: "Benvenuto su Fit ABB",
  },
  {
    src: "https://media.base44.com/videos/public/6900e246d71384c10b97f155/f0976576c_generated_video.mp4",
    label: "Check-in in 5 secondi",
  },
  {
    src: "https://media.base44.com/videos/public/6900e246d71384c10b97f155/7bcb395cc_generated_video.mp4",
    label: "Centinaia di palestre in Italia",
  },
  {
    src: "https://media.base44.com/videos/public/6900e246d71384c10b97f155/27c151efe_generated_video.mp4",
    label: "Monitora i tuoi progressi",
  },
  {
    src: "https://media.base44.com/videos/public/6900e246d71384c10b97f155/ccc9242c4_generated_video.mp4",
    label: "Scegli il tuo piano",
  },
];

export default function VideoSlideshow() {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef(null);

  const goTo = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [current]);

  const handleEnded = () => {
    setCurrent((prev) => (prev + 1) % CLIPS.length);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#E8FF00]/5 bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        key={current}
        src={CLIPS[current].src}
        onEnded={handleEnded}
        autoPlay
        muted
        playsInline
        className="w-full aspect-video object-cover"
      />

      {/* Label overlay */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <span className="bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/20">
          {CLIPS[current].label}
        </span>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {CLIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-[#E8FF00]" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}