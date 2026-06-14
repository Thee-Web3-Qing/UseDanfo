export default function Slide5DanfoGPT() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center" style={{ background: "linear-gradient(135deg, #111111 0%, #1a1500 100%)" }}>
      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[3px] bg-primary" />
      <div className="absolute right-[5vw] top-[50%]" style={{ transform: "translateY(-50%)" }}>
        <div className="w-[38vw] h-[55vh] rounded-2xl flex flex-col justify-between p-[3vw]" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <div>
            <div className="flex items-center gap-[1vw] mb-[3vh]">
              <div className="w-[2.5vw] h-[2.5vw] rounded-full bg-primary flex items-center justify-center">
                <span className="font-display text-bg" style={{ fontSize: "1.2vw" }}>D</span>
              </div>
              <span className="font-display text-primary" style={{ fontSize: "1.8vw" }}>DanfoGPT</span>
            </div>
            <div className="rounded-xl p-[2vh_1.5vw] mb-[2.5vh]" style={{ background: "#252525" }}>
              <p className="font-body text-muted" style={{ fontSize: "1.7vw" }}>How do I get from Yaba to Victoria Island?</p>
            </div>
            <div className="rounded-xl p-[2vh_1.5vw]" style={{ background: "#1f1800", border: "1px solid rgba(255,199,44,0.2)" }}>
              <p className="font-body text-text leading-relaxed" style={{ fontSize: "1.7vw" }}>
                Oya! Board a danfo at Yaba bus stop heading to CMS. Drop at CMS, then take a keke or bus to VI. Fare: around ₦300–400. About 45 mins, sha.
              </p>
            </div>
          </div>
          <div className="h-[1px] bg-white opacity-10 mt-[2vh]" />
        </div>
      </div>
      <div className="pl-[7vw] pr-[4vw] w-[55vw]">
        <span className="font-body text-primary mb-[3vh] block" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>AI Assistant</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[4vh]" style={{ fontSize: "6vw" }}>
          DanfoGPT
        </h2>
        <p className="font-body text-text leading-relaxed mb-[2vh]" style={{ fontSize: "2.2vw", opacity: 0.9, textWrap: "pretty" }}>
          An AI routing assistant trained on community data.
        </p>
        <p className="font-body text-muted leading-relaxed" style={{ fontSize: "2vw", textWrap: "pretty" }}>
          Step-by-step directions, transfer points, and fare estimates — in Lagos voice.
        </p>
      </div>
    </div>
  );
}
