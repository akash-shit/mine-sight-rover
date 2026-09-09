import { motion } from "motion/react";

const FLOW = [
  { title: "Underground Mine", detail: "Hazardous, unsurveyed tunnel section" },
  { title: "Mine Rover", detail: "ESP32-driven tracked platform enters ahead of crews" },
  { title: "Multi-Sensor Acquisition", detail: "MQ-2 · MQ-7 · MQ-9 · DHT22 · MPU6050 · HC-SR04" },
  { title: "Wireless Telemetry", detail: "Wi-Fi uplink streams frames to the surface" },
  { title: "Surface Server", detail: "Python + Flask ingest, SQLite mission store" },
  { title: "AI + Mapping", detail: "YOLO11s + OpenCV vision, 2D ultrasonic tunnel map" },
  { title: "Alert Engine", detail: "Threshold logic raises graded hazard events" },
  { title: "Control Station", detail: "Mission-control console for the whole picture" },
  { title: "Rescue Operator", detail: "Commands the rover, plans safe entry" },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-6 py-24" aria-labelledby="how-heading">
      <p className="label-chip text-signal">SYSTEM FLOW</p>
      <h2 id="how-heading" className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        How AEGIS works
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Every stage from the rock face to the rescue commander's screen, with no human sent in first.
      </p>

      <ol className="relative mt-10 space-y-0">
        <span className="absolute bottom-4 left-[15px] top-4 w-px bg-hairline" aria-hidden />
        {FLOW.map((node, i) => (
          <motion.li
            key={node.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.2, 0.7, 0.3, 1] }}
            className="relative flex gap-4 pb-7 pl-0"
          >
            <span className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-signal/50 bg-background">
              <span className="readout text-[11px] text-signal">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <div className="pt-1.5">
              <h3 className="label-chip text-foreground">{node.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{node.detail}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
