export default function Slide6Growth() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center" style={{ background: "#111111" }}>
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
      <div className="absolute top-0 right-0 w-[45vw] h-full" style={{ background: "linear-gradient(to left, rgba(255,199,44,0.03), transparent)" }} />
      <div className="pl-[10vw] pr-[8vw]">
        <span className="font-body text-primary mb-[3vh] block" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>Engagement</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[7vh]" style={{ fontSize: "5vw" }}>
          Built to Grow
        </h2>
        <div className="grid grid-cols-3 gap-[3vw]">
          <div className="flex flex-col gap-[2vh]">
            <div className="w-[4vw] h-[4vw] flex items-center justify-center" style={{ border: "2px solid #FFC72C", borderRadius: "0.8vw" }}>
              <span className="font-display text-primary" style={{ fontSize: "2vw" }}>★</span>
            </div>
            <h3 className="font-display text-primary leading-tight" style={{ fontSize: "2.4vw" }}>Badges</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Badges reward top contributors for every route shared
            </p>
          </div>
          <div className="flex flex-col gap-[2vh]">
            <div className="w-[4vw] h-[4vw] flex items-center justify-center" style={{ border: "2px solid #FFC72C", borderRadius: "0.8vw" }}>
              <span className="font-display text-primary" style={{ fontSize: "2vw" }}>◑</span>
            </div>
            <h3 className="font-display text-primary leading-tight" style={{ fontSize: "2.4vw" }}>Wrapped</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Your year of Lagos routes — personalised stats and rank
            </p>
          </div>
          <div className="flex flex-col gap-[2vh]">
            <div className="w-[4vw] h-[4vw] flex items-center justify-center" style={{ border: "2px solid #FFC72C", borderRadius: "0.8vw" }}>
              <span className="font-display text-primary" style={{ fontSize: "2vw" }}>▲</span>
            </div>
            <h3 className="font-display text-primary leading-tight" style={{ fontSize: "2.4vw" }}>Leaderboards</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Leaderboards and personal stats keep contributors coming back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
