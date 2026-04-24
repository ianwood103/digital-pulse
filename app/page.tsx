export const revalidate = 3600;

import Image from "next/image";
import BookShelf from "./book-shelf";
import GithubGraph from "./github-graph";
import PulseCard from "./pulse-card";
import RunningSection from "./running-section";
import { fetchBooks } from "./lib/books";
import { formatLongDate } from "./lib/format";
import { getAllPosts } from "./lib/posts";
import { fetchContributionYear } from "./lib/github";
import { fetchRuns } from "./lib/strava";

const EMAIL = "ian.albert.wood@gmail.com";
const PHONE = "770-656-1244";
const GITHUB = "https://github.com/ianwood103";
const LINKEDIN = "https://linkedin.com/in/ian-albert-wood";

export default async function Home() {
  const [booksData, runs] = await Promise.all([
    fetchBooks().catch(() => ({
      currentlyReading: [],
      wantToRead: [],
      readThisYear: [],
    })),
    fetchRuns().catch(() => []),
  ]);

  const posts = getAllPosts();
  const contributionData = await fetchContributionYear("ianwood103");
  const runMonthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
  });

  return (
    <>
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
            <div className="s-name">Ian Wood</div>
            <div className="s-sub">Software Engineer</div>

            <nav id="mainNav">
              <div className="nav-indicator" id="navIndicator" />
              <a href="#now" className="active" data-section="now">
                Now
              </a>
              <a href="#running" data-section="running">
                Running
              </a>
              <a href="#reading" data-section="reading">
                Reading
              </a>
              <a href="#writing" data-section="writing">
                Writing
              </a>
              <a href="#work" data-section="work">
                Work
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
          {/* ── NOW ── */}
          <section id="now" className="reveal">
            <div className="pulse-grid">
              <PulseCard kind="run" run={runs[0]} />
              <PulseCard kind="reading" book={booksData.currentlyReading[0]} />
              <PulseCard kind="post" post={posts[0]} />
            </div>

            <div className="now-headline">
              Engineer. Reader.
              <br />
              <em>Builder.</em>
            </div>

            <p className="now-bio">
              I&apos;m a software engineer at Tesla in Austin. I read a lot —
              philosophy mostly, Stoics in particular. I follow baseball with
              an investment that probably isn&apos;t warranted. I cook. I build
              side projects. I&apos;m the kind of person who goes unreasonably
              deep on things, and the things change often. This site is a
              window into what&apos;s currently in rotation.
            </p>

            <div className="credential-pills">
              <span className="pill">Software @ Tesla</span>
              <span className="pill">Georgia Tech CS</span>
              <span className="pill">Austin, TX</span>
            </div>
          </section>

          {/* ── RUNNING ── */}
          <section id="running" className="reveal">
            <div className="section-label">
              Running <span id="runMonthLabel">{`// ${runMonthLabel}`}</span>
            </div>
            <div id="runningContent">
              <RunningSection runs={runs} />
            </div>
          </section>

          {/* ── READING ── */}
          <section id="reading" className="reveal">
            <div className="section-label">Reading</div>
            <BookShelf
              currentlyReading={booksData.currentlyReading}
              wantToRead={booksData.wantToRead}
              readThisYear={booksData.readThisYear}
            />
          </section>

          {/* ── WRITING ── */}
          <section id="writing" className="reveal">
            <div className="section-label">Writing</div>
            {posts.length === 0 ? (
              <p className="empty-post">No posts yet.</p>
            ) : (
              <div className="post-list">
                {posts.map((post) => (
                  <a
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="post-item"
                  >
                    <div className="post-item-meta">
                      {formatLongDate(post.date)} · {post.readTime} read
                    </div>
                    <div className="post-title">{post.title}</div>
                    <div className="post-excerpt">{post.excerpt}</div>
                    <span className="post-arrow">→</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* ── WORK ── */}
          <section id="work" className="reveal">
            <div className="section-label">Work</div>

            {/* Experience */}
            <div className="work-sub">Experience</div>

            <div className="work-item">
              <div className="work-meta">
                Mar 2025
                <br />— Present
                <br />
                <br />
                Austin, TX
              </div>
              <div>
                <div className="work-company">
                  Tesla{" "}
                  <span className="work-badge">Current</span>
                </div>
                <div className="work-role">
                  Software Engineer — Factory Software
                </div>
                <div className="work-desc">
                  <p className="exp-paragraph">
                    Building the internal tools that help Tesla maintain
                    equipment across six global factories — full-stack, at
                    scale. I work across Go microservices, MySQL, Kubernetes,
                    and Kafka day-to-day, with a focus on reliability and
                    performance at millions of records. Increasingly, I lean on
                    AI to accelerate how I build.
                  </p>
                </div>
                <div className="work-tags">
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

            <div className="work-item">
              <div className="work-meta">
                May 2024
                <br />— Aug 2024
                <br />
                <br />
                Fremont, CA
              </div>
              <div>
                <div className="work-company">Tesla</div>
                <div className="work-role">Software Engineer Intern</div>
                <div className="work-desc">
                  <p className="exp-paragraph">
                    My first exposure to Tesla&apos;s scale — built features
                    for the same factory tool I now own full-time, plus an API
                    for forms and workflows used by 20,000+ people across the
                    company.
                  </p>
                </div>
                <div className="work-tags">
                  <span className="tag">Go</span>
                  <span className="tag">MySQL</span>
                  <span className="tag">Angular</span>
                  <span className="tag">Kafka</span>
                  <span className="tag">Grafana</span>
                </div>
              </div>
            </div>

            <div className="work-item">
              <div className="work-meta">
                May 2022
                <br />— Aug 2022
                <br />
                <br />
                Atlanta, GA
              </div>
              <div>
                <div className="work-company">FlightBridge</div>
                <div className="work-role">Software Engineer Intern</div>
                <div className="work-desc">
                  <p className="exp-paragraph">
                    Built booking and hotel tools for private aviation — a
                    maps-based hotel visualization and a C# recommendation
                    engine that improved search relevance for 1,000+ customers.
                  </p>
                </div>
                <div className="work-tags">
                  <span className="tag">ASP.NET</span>
                  <span className="tag">C#</span>
                  <span className="tag">SQL</span>
                  <span className="tag">Google Maps API</span>
                </div>
              </div>
            </div>

            <div className="work-item">
              <div className="work-meta">
                May 2021
                <br />— Aug 2021
                <br />
                <br />
                Alpharetta, GA
              </div>
              <div>
                <div className="work-company">Griffin Solutions Group</div>
                <div className="work-role">Software Engineer Intern</div>
                <div className="work-desc">
                  <p className="exp-paragraph">
                    First real SWE internship — React frontend and Node.js
                    APIs. Where I fell in love with full-stack.
                  </p>
                </div>
                <div className="work-tags">
                  <span className="tag">React</span>
                  <span className="tag">Node.js</span>
                  <span className="tag">PostgreSQL</span>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="work-sub">Education</div>

            <div className="edu-block">
              <div className="work-meta">
                Aug 2021
                <br />— Dec 2024
                <br />
                <br />
                Atlanta, GA
              </div>
              <div>
                <div className="edu-name">
                  Georgia Institute of Technology
                </div>
                <div className="edu-degree">B.S. Computer Science</div>
                <div className="edu-note">
                  Research Assistant — Data-Driven Product Design for
                  Non-Profits
                </div>
                <div className="gpa-badge">4.00 / 4.00 GPA</div>
              </div>
            </div>

            {/* Projects */}
            <div className="work-sub">Projects</div>

            <div className="project-list">
              <div className="project-row">
                <div className="project-row-name">Multi-Agent Coding System</div>
                <div className="project-row-stack">Claude Code · GitHub Actions · Vercel</div>
                <div className="project-row-desc">
                  Automated PR workflow powered by Claude Code agents. Issues
                  become branches, code reviews, and deployments — triggered
                  from a phone.
                </div>
                <a
                  href={GITHUB}
                  className="project-row-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              </div>

              <div className="project-row">
                <div className="project-row-name">ianwood.dev</div>
                <div className="project-row-stack">Next.js · TypeScript · Vercel</div>
                <div className="project-row-desc">
                  This portfolio — automated deployment pipeline via Claude
                  Code and GitHub PRs. Changes ship from a phone without
                  touching a desktop.
                </div>
                <a
                  href="https://ianwood.dev"
                  className="project-row-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live ↗
                </a>
              </div>

              <div className="project-row">
                <div className="project-row-name">Magnidia</div>
                <div className="project-row-stack">Next.js · TypeScript · PostgreSQL</div>
                <div className="project-row-desc">
                  Led a 6-person team as project manager to build a web app
                  for creating and sharing events. Built with TypeScript,
                  Next.js, Tailwind, NextAuth, Google Cloud, Prisma, and AWS.
                </div>
                <a
                  href="https://magnidia.com"
                  className="project-row-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live ↗
                </a>
              </div>
            </div>

            {/* Recent Activity — nested under Projects */}
            <div className="work-sub-sub">Recent Activity</div>
            <GithubGraph data={contributionData} />

            {/* Certifications */}
            <div className="work-sub">Certifications</div>

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

            {/* Skills */}
            <div className="work-sub">Skills</div>

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
        </main>
      </div>
    </>
  );
}
