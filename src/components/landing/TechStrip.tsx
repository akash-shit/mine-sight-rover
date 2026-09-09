import { motion } from "motion/react";
import {
  Camera,
  Cpu,
  Database,
  Eye,
  Flame,
  Gauge,
  Move3d,
  Radar,
  Server,
  Thermometer,
  Wind,
  CloudFog,
  Code2,
} from "lucide-react";

const STACK = [
  { icon: Cpu, name: "ESP32", role: "Rover MCU" },
  { icon: Camera, name: "ESP32-CAM", role: "Video node" },
  { icon: CloudFog, name: "MQ-2", role: "Methane / smoke" },
  { icon: Wind, name: "MQ-7", role: "Carbon monoxide" },
  { icon: Flame, name: "MQ-9", role: "Combustible gas" },
  { icon: Thermometer, name: "DHT22", role: "Temp / humidity" },
  { icon: Move3d, name: "MPU6050", role: "Tilt / vibration" },
  { icon: Radar, name: "HC-SR04", role: "Ultrasonic range" },
  { icon: Code2, name: "Python", role: "Server runtime" },
  { icon: Server, name: "Flask", role: "REST + streams" },
  { icon: Eye, name: "YOLO11s", role: "Object detection" },
  { icon: Gauge, name: "OpenCV", role: "Frame pipeline" },
  { icon: Database, name: "SQLite", role: "Mission store" },
];

export function TechStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16" aria-labelledby="stack-heading">
      <p className="label-chip text-data">HARDWARE & SOFTWARE</p>
      <h2 id="stack-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Built on the real stack
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {STACK.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.32, delay: i * 0.03 }}
            className="panel flex items-center gap-2.5 rounded-sm px-3 py-2.5 transition-colors hover:border-signal/50"
          >
            <item.icon className="h-4 w-4 shrink-0 text-signal" aria-hidden />
            <div className="min-w-0">
              <div className="label-chip truncate text-foreground">{item.name}</div>
              <div className="label-chip truncate text-muted-foreground">{item.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
