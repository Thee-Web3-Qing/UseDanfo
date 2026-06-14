export default function Slide7TechStack() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center" style={{ background: "#111111" }}>
      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
      <div className="absolute bottom-[10vh] right-[7vw] font-display text-text opacity-5 leading-none select-none" style={{ fontSize: "18vw" }}>
        {"</>"}
      </div>
      <div className="px-[7vw] relative z-10">
        <span className="font-body text-primary mb-[3vh] block" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>Under the Hood</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[6vh]" style={{ fontSize: "5vw" }}>
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 gap-[3vw] max-w-[80vw]">
          <div className="p-[2.5vh_2.5vw]" style={{ background: "#1a1a1a", borderLeft: "3px solid #FFC72C" }}>
            <h3 className="font-display text-primary mb-[2vh]" style={{ fontSize: "2vw" }}>Frontend</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.1vw", opacity: 0.9 }}>
              React + Vite
            </p>
          </div>
          <div className="p-[2.5vh_2.5vw]" style={{ background: "#1a1a1a", borderLeft: "3px solid #FFC72C" }}>
            <h3 className="font-display text-primary mb-[2vh]" style={{ fontSize: "2vw" }}>Backend</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.1vw", opacity: 0.9 }}>
              Express API
            </p>
          </div>
          <div className="p-[2.5vh_2.5vw]" style={{ background: "#1a1a1a", borderLeft: "3px solid #FFC72C" }}>
            <h3 className="font-display text-primary mb-[2vh]" style={{ fontSize: "2vw" }}>Database</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.1vw", opacity: 0.9 }}>
              PostgreSQL + Drizzle ORM
            </p>
          </div>
          <div className="p-[2.5vh_2.5vw]" style={{ background: "#1a1a1a", borderLeft: "3px solid #FFC72C" }}>
            <h3 className="font-display text-primary mb-[2vh]" style={{ fontSize: "2vw" }}>Intelligence</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.1vw", opacity: 0.9 }}>
              GeoAPI · Qwen AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
