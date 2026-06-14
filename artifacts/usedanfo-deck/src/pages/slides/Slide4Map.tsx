const base = import.meta.env.BASE_URL;

export default function Slide4Map() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ background: "#0d0d0d" }}>
      <div className="absolute inset-0">
        <img
          src={`${base}lagos-map.png`}
          crossOrigin="anonymous"
          alt="Lagos route map"
          className="w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)" }} />
      </div>
      <div className="relative z-10 flex flex-col justify-center pl-[7vw] pr-[4vw] w-[55vw]">
        <span className="font-body text-primary mb-[3vh]" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>Community Map</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[4vh]" style={{ fontSize: "5vw", textWrap: "balance" }}>
          Built by those who know the streets
        </h2>
        <p className="font-body text-text leading-relaxed mb-[2vh]" style={{ fontSize: "2.2vw", opacity: 0.9, textWrap: "pretty" }}>
          An interactive map of Lagos built entirely from what contributors know.
        </p>
        <p className="font-body text-muted leading-relaxed" style={{ fontSize: "2vw", textWrap: "pretty" }}>
          Routes, stops, and transfer points — all crowd-sourced.
        </p>
        <div className="mt-[5vh] flex items-center gap-[1.5vw]">
          <div className="h-[3px] w-[4vw] bg-primary" />
          <span className="font-body text-primary" style={{ fontSize: "1.8vw" }}>Growing every day</span>
        </div>
      </div>
    </div>
  );
}
