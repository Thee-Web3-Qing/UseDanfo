export default function Slide9Closing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-between" style={{ background: "#111111" }}>
      <div className="absolute top-0 right-0 w-[3px] h-full bg-primary" />
      <div className="absolute top-0 left-0 w-[60vw] h-[3px] bg-primary" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 10% 80%, rgba(255,199,44,0.06) 0%, transparent 60%)" }} />
      <div className="absolute right-[8vw] top-[50%]" style={{ transform: "translateY(-50%)" }}>
        <div className="font-display leading-none text-primary opacity-10 select-none" style={{ fontSize: "30vw" }}>
          D
        </div>
      </div>
      <div className="px-[7vw] pt-[8vh]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[1.2vw] h-[1.2vw] rounded-full bg-primary" />
          <span className="font-body text-muted" style={{ fontSize: "1.6vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>UseDanfo</span>
        </div>
      </div>
      <div className="relative z-10 flex flex-col justify-center flex-1 px-[7vw]">
        <h2 className="font-display text-text leading-none tracking-tight mb-[3vh]" style={{ fontSize: "4vw" }}>
          usedanfo.com
        </h2>
        <div className="h-[3px] w-[6vw] bg-primary mb-[4vh]" />
        <p className="font-display text-primary leading-tight mb-[1.5vh]" style={{ fontSize: "4.5vw" }}>
          Know a route? Share it.
        </p>
        <p className="font-display text-text leading-tight opacity-60" style={{ fontSize: "4.5vw" }}>
          Help map Lagos.
        </p>
      </div>
      <div className="px-[7vw] pb-[6vh] flex items-center gap-[2vw]">
        <div className="h-[1px] w-[4vw] bg-primary opacity-60" />
        <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Community-powered. Always free.</span>
      </div>
    </div>
  );
}
