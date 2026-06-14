export default function Slide3HowItWorks() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center" style={{ background: "#111111" }}>
      <div className="absolute top-0 right-0 w-[100vw] h-[3px] bg-primary" style={{ width: "40vw" }} />
      <div className="absolute bottom-0 left-0 h-[3px] bg-primary" style={{ width: "20vw" }} />
      <div className="px-[7vw]">
        <span className="font-body text-primary mb-[2vh] block" style={{ fontSize: "1.5vw", letterSpacing: "0.2em", textTransform: "uppercase" }}>How It Works</span>
        <h2 className="font-display text-text leading-none tracking-tight mb-[7vh]" style={{ fontSize: "5vw" }}>
          Three steps. That's it.
        </h2>
        <div className="grid grid-cols-3 gap-[3vw]">
          <div className="flex flex-col">
            <div className="w-[5vw] h-[5vw] rounded-full bg-primary flex items-center justify-center mb-[3vh]">
              <span className="font-display text-bg" style={{ fontSize: "2.5vw" }}>1</span>
            </div>
            <h3 className="font-display text-primary leading-tight mb-[2vh]" style={{ fontSize: "2.4vw" }}>Contribute</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Add routes: start area, end area, stops, fares, travel time
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-[5vw] h-[5vw] rounded-full border-2 border-primary flex items-center justify-center mb-[3vh]" style={{ borderColor: "#FFC72C" }}>
              <span className="font-display text-primary" style={{ fontSize: "2.5vw" }}>2</span>
            </div>
            <h3 className="font-display text-primary leading-tight mb-[2vh]" style={{ fontSize: "2.4vw" }}>Validate</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Community validates and expands the data over time
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-[5vw] h-[5vw] rounded-full border-2 border-primary flex items-center justify-center mb-[3vh]" style={{ borderColor: "#FFC72C" }}>
              <span className="font-display text-primary" style={{ fontSize: "2.5vw" }}>3</span>
            </div>
            <h3 className="font-display text-primary leading-tight mb-[2vh]" style={{ fontSize: "2.4vw" }}>Use It</h3>
            <p className="font-body text-text leading-relaxed" style={{ fontSize: "2vw", opacity: 0.85, textWrap: "pretty" }}>
              Anyone can search and use the growing route database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
