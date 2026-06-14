export default function Slide1Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #111111 0%, #1a1500 100%)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(255,199,44,0.08) 0%, transparent 70%)" }} />
      <div className="absolute top-0 right-0 w-[40vw] h-[3px] bg-primary" />
      <div className="absolute bottom-0 left-0 w-[25vw] h-[3px] bg-primary" />
      <div className="absolute left-[7vw] top-[7vh] flex items-center gap-[1.2vw]">
        <div className="w-[1.2vw] h-[1.2vw] rounded-full bg-primary" />
        <span className="font-body text-muted" style={{ fontSize: "1.6vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>UseDanfo</span>
      </div>
      <div className="flex flex-col justify-center flex-1 px-[7vw] pt-[4vh]">
        <div className="mb-[2vh]">
          <span className="font-body text-primary" style={{ fontSize: "1.8vw", letterSpacing: "0.15em", textTransform: "uppercase" }}>Introducing</span>
        </div>
        <h1 className="font-display text-text leading-none tracking-tighter" style={{ fontSize: "9vw", textWrap: "balance" }}>
          UseDanfo
        </h1>
        <h2 className="font-display text-primary leading-none tracking-tight mt-[1.5vh]" style={{ fontSize: "5vw" }}>
          Ó wà.
        </h2>
        <div className="mt-[5vh] max-w-[55vw]">
          <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.2vw", opacity: 0.85, textWrap: "pretty" }}>
            The first community-powered danfo route database for Lagos.
          </p>
          <p className="font-body text-muted leading-relaxed mt-[1.5vh]" style={{ fontSize: "2vw", textWrap: "pretty" }}>
            Mapping the routes the city never wrote down.
          </p>
        </div>
      </div>
      <div className="px-[7vw] pb-[5vh] flex items-center gap-[2vw]">
        <div className="h-[1px] w-[6vw] bg-primary opacity-60" />
        <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Lagos, Nigeria</span>
      </div>
    </div>
  );
}
