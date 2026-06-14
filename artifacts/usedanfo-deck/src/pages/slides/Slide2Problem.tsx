export default function Slide2Problem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ background: "#111111" }}>
      <div className="absolute top-0 left-0 w-[3px] h-full bg-primary" />
      <div className="absolute top-0 right-0 w-[30vw] h-full" style={{ background: "linear-gradient(to left, rgba(255,199,44,0.04), transparent)" }} />
      <div className="flex flex-col justify-center pl-[10vw] pr-[8vw] w-full">
        <span className="font-body text-primary mb-[3vh]" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>The Problem</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[6vh]" style={{ fontSize: "5.5vw", textWrap: "balance" }}>
          Lagos Without a Map
        </h2>
        <div className="flex flex-col gap-[3.5vh] max-w-[70vw]">
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-primary shrink-0 leading-none mt-[0.3vh]" style={{ fontSize: "3.5vw" }}>01</span>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.2vw", textWrap: "pretty" }}>
              14 million daily commuters navigate Lagos with no official bus routes
            </p>
          </div>
          <div className="h-[1px] bg-white opacity-10" />
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-primary shrink-0 leading-none mt-[0.3vh]" style={{ fontSize: "3.5vw" }}>02</span>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.2vw", textWrap: "pretty" }}>
              Danfo routes exist only in the memory of drivers and regular riders
            </p>
          </div>
          <div className="h-[1px] bg-white opacity-10" />
          <div className="flex items-start gap-[2.5vw]">
            <span className="font-display text-primary shrink-0 leading-none mt-[0.3vh]" style={{ fontSize: "3.5vw" }}>03</span>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2.2vw", textWrap: "pretty" }}>
              Newcomers, visitors, and irregular travellers are left guessing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
