import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { links } from "../data/site";
import { jobs, type Job } from "../data/jobs";
import PixelBackground from "../components/ui/PixelBackground";
import DiscordIcon from "../components/ui/DiscordIcon";
import Reveal from "../components/ui/Reveal";
import FlyIn from "../components/ui/FlyIn";
import SplitText from "../components/ui/SplitText";

function JobCard({ job }: { job: Job }) {
  const Icon = job.icon;
  return (
    <div className="job-card" style={{ "--accent": job.color } as CSSProperties}>
      <span className="job-side-bar" aria-hidden />

      <div className="job-top">
        <span className="job-icon">
          <Icon size={22} />
        </span>
        <span className={`job-status ${job.open ? "is-open" : "is-closed"}`}>
          {job.open ? "Hiring" : "Closed"}
        </span>
      </div>

      <h3 className="job-title">{job.title}</h3>
      <p className="job-desc">{job.desc}</p>

      <ul className="job-reqs">
        {job.requirements.map((r) => (
          <li key={r}>
            <Check size={14} /> {r}
          </li>
        ))}
      </ul>

      {job.open ? (
        <a href={links.apply} target="_blank" rel="noreferrer" className="mc-btn job-btn">
          <DiscordIcon size={16} />
          Apply Now
        </a>
      ) : (
        <span className="mc-btn job-btn is-disabled">Applications Closed</span>
      )}
    </div>
  );
}

const steps = [
  { n: "01", title: "Join our Discord", text: "Click Apply and join the HFQ Discord server." },
  { n: "02", title: "Open an application", text: "Go to #applications and open a ticket for your role." },
  { n: "03", title: "Wait for review", text: "Our team reviews every application and replies in your ticket." },
];

export default function Jobs() {
  return (
    <section className="jobs">
      <PixelBackground className="jobs-pixels" seed={11} />

      <div className="jobs-container">
        <div className="jobs-head">
          <Reveal>
            <p className="jobs-kicker">
              <span className="pixel-line" /> We&apos;re Hiring <span className="pixel-line" />
            </p>
          </Reveal>
          <SplitText as="h1" className="jobs-title" text="Wanna be part of HFQ?" delay={0.15} />
          <Reveal delay={0.4}>
            <p className="jobs-sub">
              Help us build the best lifesteal server around. Pick a role, hit apply, and join the team.
            </p>
          </Reveal>
        </div>

        <div className="jobs-grid">
          {jobs.map((job, i) => (
            <FlyIn key={job.id} from={i % 2 === 0 ? "left" : "right"} delay={0.1 + i * 0.1}>
              <JobCard job={job} />
            </FlyIn>
          ))}
        </div>

        <Reveal delay={0.1}>
          <h2 className="jobs-steps-title">How to apply</h2>
        </Reveal>
        <div className="jobs-steps">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={0.15 + i * 0.12}>
              <div className="job-step">
                <span className="job-step-n">{s.n}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
