import Image from "next/image";
import PortfolioEffects from "./portfolio-effects";

const EMAIL = "ian.albert.wood@gmail.com";
const PHONE = "770-656-1244";
const GITHUB = "https://github.com/ianwood103";
const LINKEDIN = "https://linkedin.com/in/ian-albert-wood";

export default function Home() {
  return (
    <>
      <PortfolioEffects />
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="headshot-wrap">
              <Image
                src="/headshot.jpg"
                alt="Ian Wood"
                width={144}
                height={144}
                className="headshot"
                fetchPriority="high"
              />
            </div>
            <div className="name">Ian Wood</div>
            <div className="title">Software Engineer</div>

            <div className="cred-logos">
              <div className="cred-logo" aria-label="Tesla">
                <Image
                  src="/tesla.png"
                  alt="Tesla"
                  width={56}
                  height={24}
                  style={{ height: 20, width: "auto" }}
                />
              </div>
              <div className="cred-divider" />
              <div className="cred-logo" aria-label="Georgia Tech">
                <Image
                  src="/georgia-tech.png"
                  alt="Georgia Tech"
                  width={28}
                  height={28}
                  style={{ height: 28, width: "auto" }}
                />
              </div>
            </div>

            <nav id="mainNav">
              <div className="nav-indicator" id="navIndicator" />
              <a href="#about" className="active" data-section="about">
                About
              </a>
              <a href="#experience" data-section="experience">
                Experience
              </a>
              <a href="#education" data-section="education">
                Education
              </a>
              <a href="#projects" data-section="projects">
                Projects
              </a>
              <a href="#skills" data-section="skills">
                Skills
              </a>
              <a href="#certifications" data-section="certifications">
                Certifications
              </a>
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-links">
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a>
            </div>
            <div className="location">Austin, TX</div>
          </div>
        </aside>

        <main className="main">
          <section id="about" className="reveal">
            <div className="hero-headline">
              Product-minded engineer,
              <br />
              <em>full-stack</em> and AI-native.
            </div>
            <div className="credential-pills">
              <span className="pill">Software @ Tesla</span>
              <span className="pill">Georgia Tech</span>
              <span className="pill">Azure AZ-900</span>
              <span className="pill">Austin, TX</span>
            </div>
            <p className="hero-bio">
              I build software end-to-end — from pixel-level UI to system
              architecture — with a focus on shipping things that matter to the
              business. Currently at Tesla building factory infrastructure used
              by 50,000+ people. AI-native by instinct: I reach for agents and
              automation before boilerplate.
            </p>
            <div className="hero-actions">
              <a href={`mailto:${EMAIL}`} className="btn btn-primary">
                Get in touch
              </a>
              <a
                href={GITHUB}
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                href={LINKEDIN}
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn ↗
              </a>
            </div>
          </section>

          <section id="experience" className="reveal">
            <div className="section-label">
              Experience <span>{"// 4 roles"}</span>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                Mar 2025
                <br />— Present
                <br />
                <br />
                Austin, TX
              </div>
              <div>
                <div className="exp-company">
                  Tesla{" "}
                  <span className="exp-company-badge">Current</span>
                </div>
                <div className="exp-role">
                  Software Engineer — Factory Software
                </div>
                <ul className="exp-bullets">
                  <li>
                    Deploy full-stack features in Agile 2-week sprints for an
                    internal factory tool tracking equipment maintenance data
                    used by 50,000+ people.
                  </li>
                  <li>
                    Build and maintain high-performance Go microservices using
                    Docker and Kubernetes, with MySQL query optimization across
                    millions of maintenance orders at 6 global factories.
                  </li>
                  <li>
                    Improve system reliability via Splunk, Grafana, and
                    database profiling; led database partitioning initiative
                    for scalability.
                  </li>
                  <li>
                    Manage Kafka infrastructure including topic creation,
                    certificate handling, and messaging reliability.
                  </li>
                  <li>
                    Utilize custom AI workflows to automate and accelerate
                    development processes.
                  </li>
                </ul>
                <div className="exp-tags">
                  <span className="tag">Go</span>
                  <span className="tag">MySQL</span>
                  <span className="tag">Kubernetes</span>
                  <span className="tag">Docker</span>
                  <span className="tag">Kafka</span>
                  <span className="tag">Grafana</span>
                  <span className="tag">Splunk</span>
                </div>
              </div>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                May 2024
                <br />— Aug 2024
                <br />
                <br />
                Fremont, CA
              </div>
              <div>
                <div className="exp-company">Tesla</div>
                <div className="exp-role">Software Engineer Intern</div>
                <ul className="exp-bullets">
                  <li>
                    Developed features for in-house equipment maintenance
                    software using Go, MySQL, and Angular.
                  </li>
                  <li>
                    Built Grafana dashboards for data analytics and equipment
                    failure prediction via a Kafka data pipeline.
                  </li>
                  <li>
                    Led design and implementation of an API for forms and
                    workflows used across the company by 20,000+ people.
                  </li>
                </ul>
                <div className="exp-tags">
                  <span className="tag">Go</span>
                  <span className="tag">MySQL</span>
                  <span className="tag">Angular</span>
                  <span className="tag">Kafka</span>
                  <span className="tag">Grafana</span>
                </div>
              </div>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                May 2022
                <br />— Aug 2022
                <br />
                <br />
                Atlanta, GA
              </div>
              <div>
                <div className="exp-company">FlightBridge</div>
                <div className="exp-role">Software Engineer Intern</div>
                <ul className="exp-bullets">
                  <li>
                    Developed an online booking and management platform for the
                    private aviation industry.
                  </li>
                  <li>
                    Built a hotel visualization tool using ASP.NET and the
                    Google Maps API for 1,000+ customers.
                  </li>
                  <li>
                    Used SQL and LINQ in C# to build a hotel recommendation
                    engine that increased search efficiency.
                  </li>
                </ul>
                <div className="exp-tags">
                  <span className="tag">ASP.NET</span>
                  <span className="tag">C#</span>
                  <span className="tag">SQL</span>
                  <span className="tag">Google Maps API</span>
                </div>
              </div>
            </div>

            <div className="exp-item">
              <div className="exp-meta">
                May 2021
                <br />— Aug 2021
                <br />
                <br />
                Alpharetta, GA
              </div>
              <div>
                <div className="exp-company">Griffin Solutions Group</div>
                <div className="exp-role">Software Engineer Intern</div>
                <ul className="exp-bullets">
                  <li>
                    Developed frontend features in React and built API
                    endpoints with Node.js and PostgreSQL in an Agile
                    development cycle.
                  </li>
                </ul>
                <div className="exp-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">PostgreSQL</span>
                </div>
              </div>
            </div>
          </section>

          <section id="education" className="reveal">
            <div className="section-label">Education</div>
            <div className="edu-item">
              <div className="exp-meta">
                Aug 2021
                <br />— Dec 2024
                <br />
                <br />
                Atlanta, GA
              </div>
              <div>
                <div className="edu-school">
                  Georgia Institute of Technology
                </div>
                <div className="edu-degree">B.S. Computer Science</div>
                <div className="edu-notes">
                  Research Assistant — Data-Driven Product Design for
                  Non-Profits
                </div>
                <div className="gpa-badge">4.00 / 4.00 GPA</div>
              </div>
            </div>
          </section>

          <section id="projects" className="reveal">
            <div className="section-label">Projects</div>
            <div className="project-grid">
              <div className="project-item">
                <div>
                  <div className="project-name">
                    Magnidia
                    <span className="project-stack">
                      Next.js · TypeScript · PostgreSQL
                    </span>
                  </div>
                  <div className="project-desc">
                    Led a 6-person team as project manager to build a web app
                    for creating and sharing events. Built with TypeScript,
                    Next.js, Tailwind, NextAuth, Google Cloud, Prisma, and AWS.
                  </div>
                  <div className="exp-tags" style={{ marginTop: 10 }}>
                    <span className="tag">Next.js</span>
                    <span className="tag">TypeScript</span>
                    <span className="tag">PostgreSQL</span>
                    <span className="tag">AWS</span>
                    <span className="tag">Prisma</span>
                  </div>
                </div>
                <div className="project-meta">
                  <span className="project-year">2024</span>
                  <a
                    href="https://magnidia.com"
                    className="project-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live ↗
                  </a>
                </div>
              </div>

              <div className="project-item">
                <div>
                  <div className="project-name">
                    ianwood.dev
                    <span className="project-stack">
                      Claude Code · Vercel · CI/CD
                    </span>
                  </div>
                  <div className="project-desc">
                    Automated deployment pipeline via Claude Code + GitHub PRs
                    + Vercel preview URLs. Changes ship from a phone without
                    touching a desktop.
                  </div>
                  <div className="exp-tags" style={{ marginTop: 10 }}>
                    <span className="tag">Claude Code</span>
                    <span className="tag">Vercel</span>
                    <span className="tag">GitHub Actions</span>
                  </div>
                </div>
                <div className="project-meta">
                  <span className="project-year">2026</span>
                  <a
                    href="https://ianwood.dev"
                    className="project-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live ↗
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section id="skills" className="reveal">
            <div className="section-label">Skills</div>
            <div className="skills-grid">
              <div>
                <div className="skill-group-label">Languages</div>
                <ul className="skill-list">
                  <li>Go</li>
                  <li>Python</li>
                  <li>TypeScript</li>
                  <li>C#</li>
                  <li>Java</li>
                  <li>SQL</li>
                </ul>
              </div>
              <div>
                <div className="skill-group-label">Web</div>
                <ul className="skill-list">
                  <li>Next.js</li>
                  <li>React</li>
                  <li>Node.js</li>
                  <li>ASP.NET</li>
                  <li>Tailwind</li>
                  <li>HTML/CSS</li>
                </ul>
              </div>
              <div>
                <div className="skill-group-label">Infrastructure</div>
                <ul className="skill-list">
                  <li>Docker</li>
                  <li>Kubernetes</li>
                  <li>Kafka</li>
                  <li>Jenkins</li>
                  <li>Grafana</li>
                  <li>Splunk</li>
                </ul>
              </div>
              <div>
                <div className="skill-group-label">Data &amp; Cloud</div>
                <ul className="skill-list">
                  <li>MySQL</li>
                  <li>PostgreSQL</li>
                  <li>ClickHouse</li>
                  <li>Azure</li>
                  <li>AWS</li>
                  <li>Git</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="certifications" className="reveal">
            <div className="section-label">Certifications</div>
            <div className="cert-item">
              <div className="cert-icon">AZ</div>
              <div>
                <div className="cert-name">Microsoft Azure Fundamentals</div>
                <div className="cert-meta">AZ-900 · May 2025</div>
                <a
                  href="https://learn.microsoft.com/en-us/users/IanWood-7304/credentials/73C405740EA2E23"
                  className="cert-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View credential ↗
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
