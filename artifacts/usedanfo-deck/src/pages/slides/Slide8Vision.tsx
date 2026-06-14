export default function Slide8Vision() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center items-center text-center" style={{ background: "linear-gradient(135deg, #111111 0%, #1a1500 100%)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,199,44,0.07) 0%, transparent 65%)" }} />
      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary" />
      <div className="relative z-10 px-[10vw]">
        <span className="font-body text-primary mb-[4vh] block" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>The Bigger Picture</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[6vh]" style={{ fontSize: "5vw", textWrap: "balance" }}>
          What Gets Built
        </h2>
        <div className="h-[3px] w-[8vw] bg-primary mx-auto mb-[6vh]" />
        <p className="font-body text-text leading-relaxed mb-[3vh]" style={{ fontSize: "2.6vw", opacity: 0.95, textWrap: "pretty" }}>
          A living transport brain for Lagos — searchable, updatable, community-owned.
        </p>
        <p className="font-body text-muted leading-relaxed" style={{ fontSize: "2.2vw", textWrap: "pretty" }}>
          The data that bus apps, city planners, and daily commuters all need.
        </p>
      </div>
    </div>
  );
}
