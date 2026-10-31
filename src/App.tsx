import { useEffect, useRef, useState, type FormEvent } from "react";

const trainingAreas = [
  {
    number: "01",
    name: "Strength",
    description:
      "Build real-world strength with purposeful programming, expert guidance, and room to progress at your own pace.",
    image: "/images/strength.jpg",
    alt: "Athlete training with a barbell in the gym",
  },
  {
    number: "02",
    name: "Conditioning",
    description:
      "Find your edge, improve your endurance, and discover just how good moving can feel.",
    image: "/images/conditioning.jpg",
    alt: "Athlete training on a rowing machine",
  },
  {
    number: "03",
    name: "Recovery",
    description:
      "Make space to reset. Mobility and mindful movement help you come back stronger, every time.",
    image: "/images/recovery.jpg",
    alt: "Athlete stretching in a calm training studio",
  },
];

const plans = [
  {
    number: "01",
    name: "Open Gym",
    description: "Your time. Your training. Your space.",
    monthly: 89,
    yearly: 76,
    features: [
      "Unlimited gym floor access",
      "Premium training equipment",
      "An introductory fitness consultation",
    ],
  },
  {
    number: "02",
    name: "All Access",
    description: "Everything you need to keep moving forward.",
    monthly: 139,
    yearly: 118,
    features: [
      "Everything in Open Gym",
      "Unlimited coached group sessions",
      "Monthly progress check-in",
    ],
  },
];

function ArrowIcon({ diagonal = false, size = 19 }: { diagonal?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M5 19 19 5M7 5h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <path d="M2 32 17 6h7L9 32H2ZM16 32 31 6h7L23 32h-7Z" fill="currentColor" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="section-label">{children}</span>;
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTraining, setActiveTraining] = useState(0);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [modalOpen, setModalOpen] = useState(false);
  const [interest, setInterest] = useState("Not sure yet");
  const [draftReady, setDraftReady] = useState(false);
  const [preparedMailto, setPreparedMailto] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (modalOpen && draftReady) successHeadingRef.current?.focus();
  }, [modalOpen, draftReady]);

  const openInquiry = (selectedInterest = "Not sure yet") => {
    setInterest(selectedInterest);
    setDraftReady(false);
    setPreparedMailto("");
    setMenuOpen(false);
    setModalOpen(true);
  };

  const handleInquirySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const visitTime = String(form.get("visitTime") || "No preference");

    const subject = `Fitness Care visit request - ${interest}`;
    const body = [
      "Hello Fitness Care,",
      "",
      "I'd like to arrange a visit and learn more about the gym.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Interested in: ${interest}`,
      `Preferred time: ${visitTime}`,
      "",
      "Please get in touch when you can. Thank you!",
    ].join("\n");

    const mailto = `mailto:hello@fitnesscare.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPreparedMailto(mailto);
    setDraftReady(true);
    window.location.href = mailto;
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className={`site-header${scrolled || menuOpen ? " is-scrolled" : ""}`}>
        <div className="header-inner page-container">
          <a className="brand" href="#top" aria-label="Fitness Care, back to top" onClick={() => setMenuOpen(false)}>
            <BrandMark />
            <span className="brand-name">
              <span>FITNESS</span>
              <span>CARE</span>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#philosophy">Our approach</a>
            <a href="#training">Training</a>
            <a href="#space">The space</a>
            <a href="#membership">Membership</a>
          </nav>

          <button className="header-cta" type="button" onClick={() => openInquiry()}>
            Book a tour <ArrowIcon diagonal size={16} />
          </button>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav id="mobile-navigation" className={`mobile-nav${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
          <a href="#philosophy" onClick={() => setMenuOpen(false)}>Our approach</a>
          <a href="#training" onClick={() => setMenuOpen(false)}>Training</a>
          <a href="#space" onClick={() => setMenuOpen(false)}>The space</a>
          <a href="#membership" onClick={() => setMenuOpen(false)}>Membership</a>
          <button type="button" onClick={() => openInquiry()}>Book a tour <ArrowIcon diagonal /></button>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-inner page-container">
            <div className="hero-content">
              <span className="hero-kicker">The art of showing up</span>
              <h1 className="hero-wordmark" id="hero-title">
                <span>FITNESS</span>
                <span>CARE<span className="hero-period">.</span></span>
              </h1>
              <p className="hero-description">
                More than a place to work out. Your space to move with purpose, grow stronger, and feel at home in your body.
              </p>
              <div className="hero-actions">
                <a className="button-primary" href="#membership">
                  Explore membership <ArrowIcon size={18} />
                </a>
                <a className="text-link hero-link" href="#space">
                  Discover the space <ArrowIcon diagonal size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-section" id="philosophy" aria-labelledby="intro-title">
          <div className="intro-layout page-container">
            <SectionLabel>01 / The Fitness Care way</SectionLabel>
            <div className="intro-main">
              <h2 id="intro-title">THIS IS MORE<br />THAN FITNESS.</h2>
              <div className="intro-copy">
                <p>
                  We believe movement should build you up, not wear you down. Expert-led training, a considered space, and support that makes progress feel personal.
                </p>
                <a className="text-link dark-link" href="#training">
                  Explore how we train <ArrowIcon diagonal size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="training-section" id="training" aria-labelledby="training-title">
          <div className="page-container">
            <SectionLabel>02 / How we move</SectionLabel>
            <div className="training-heading">
              <h2 id="training-title">FIND YOUR<br />KIND OF STRONG.</h2>
              <p>Wherever you are starting from, there is a way forward. Find the movement that moves you.</p>
            </div>

            <div className="training-grid">
              <div className="training-tabs" role="tablist" aria-label="Training areas">
                {trainingAreas.map((area, index) => (
                  <button
                    key={area.name}
                    className={`training-tab${activeTraining === index ? " is-active" : ""}`}
                    type="button"
                    role="tab"
                    id={`training-tab-${index}`}
                    aria-selected={activeTraining === index}
                    aria-controls="training-panel"
                    onClick={() => setActiveTraining(index)}
                    onKeyDown={(event) => {
                      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
                      event.preventDefault();
                      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                      const next = (index + direction + trainingAreas.length) % trainingAreas.length;
                      setActiveTraining(next);
                      document.getElementById(`training-tab-${next}`)?.focus();
                    }}
                  >
                    <span className="training-tab-heading">
                      <span className="training-number">{area.number}</span>
                      <span className="training-name">{area.name}</span>
                      <ArrowIcon diagonal size={24} />
                    </span>
                    {activeTraining === index && <span className="training-description">{area.description}</span>}
                  </button>
                ))}
              </div>
              <div
                className="training-visual"
                id="training-panel"
                role="tabpanel"
                aria-labelledby={`training-tab-${activeTraining}`}
              >
                <img
                  key={trainingAreas[activeTraining].image}
                  src={trainingAreas[activeTraining].image}
                  alt={trainingAreas[activeTraining].alt}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-section" id="space" aria-labelledby="space-title">
          <div className="space-media">
            <img src="/images/studio.jpg" alt="The thoughtfully designed Fitness Care training space" loading="lazy" />
          </div>
          <div className="space-content">
            <SectionLabel>03 / The space</SectionLabel>
            <h2 id="space-title">ROOM TO<br />BECOME.</h2>
            <p>
              Every detail is designed to help you focus on what matters: your movement, your mindset, your next step.
            </p>
            <button className="text-link dark-link" type="button" onClick={() => openInquiry()}>
              Come take a look <ArrowIcon diagonal size={17} />
            </button>
          </div>
        </section>

        <section className="membership-section" id="membership" aria-labelledby="membership-title">
          <div className="page-container">
            <div className="membership-heading">
              <div>
                <SectionLabel>04 / Membership</SectionLabel>
                <h2 id="membership-title">YOUR SPACE.<br />YOUR PACE.</h2>
              </div>
              <div className="membership-aside">
                <p>Choose the way you want to move. No noise, no pressure. Just a membership that feels right for you.</p>
                <div className="billing-switch" role="group" aria-label="Billing frequency">
                  <button
                    className={billing === "monthly" ? "is-active" : ""}
                    type="button"
                    aria-pressed={billing === "monthly"}
                    onClick={() => setBilling("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={billing === "yearly" ? "is-active" : ""}
                    type="button"
                    aria-pressed={billing === "yearly"}
                    onClick={() => setBilling("yearly")}
                  >
                    Yearly <span>Save 15%</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="plan-list">
              {plans.map((plan) => (
                <div className="plan-row" key={plan.name}>
                  <div className="plan-title-group">
                    <span className="plan-number">{plan.number} / MEMBERSHIP</span>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                  <div className="plan-price" aria-label={`${billing === "monthly" ? plan.monthly : plan.yearly} dollars per month, billed ${billing === "monthly" ? "monthly" : "annually"}`}>
                    <span className="price-currency">$</span>{billing === "monthly" ? plan.monthly : plan.yearly}<span className="price-period">/mo</span>
                    <small>Billed {billing === "monthly" ? "monthly" : "annually"}</small>
                  </div>
                  <button className="plan-select" type="button" onClick={() => openInquiry(plan.name)} aria-label={`Enquire about ${plan.name}`}>
                    <ArrowIcon diagonal size={24} />
                  </button>
                </div>
              ))}
            </div>

            <p className="membership-help">
              Not sure where to start? <button type="button" onClick={() => openInquiry()}>Let's find your fit <ArrowIcon diagonal size={15} /></button>
            </p>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="page-container">
            <SectionLabel>The first step is yours</SectionLabel>
            <div className="closing-content">
              <h2 id="closing-title">LET'S GET<br />MOVING.</h2>
              <button type="button" className="closing-cta" onClick={() => openInquiry()}>
                <span className="closing-cta-circle"><ArrowIcon diagonal size={43} /></span>
                <span>Book a tour</span>
              </button>
            </div>
            <p>Come see what a different kind of gym feels like.</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          <div className="footer-main">
            <div className="footer-brand-block">
              <a href="#top" className="footer-wordmark" aria-label="Fitness Care, back to top">FITNESS<br />CARE<span>.</span></a>
              <p>Move with purpose. Feel the difference.</p>
            </div>
            <nav className="footer-links" aria-label="Footer navigation">
              <span>Explore</span>
              <a href="#philosophy">Our approach</a>
              <a href="#training">Training</a>
              <a href="#space">The space</a>
              <a href="#membership">Membership</a>
            </nav>
            <div className="footer-contact">
              <span>Say hello</span>
              <a href="mailto:hello@fitnesscare.com">hello@fitnesscare.com</a>
              <button type="button" onClick={() => openInquiry()}>Book a tour <ArrowIcon diagonal size={16} /></button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Fitness Care. All rights reserved.</span>
            <a href="#top">Back to top <ArrowIcon diagonal size={14} /></a>
          </div>
        </div>
      </footer>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}>
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setModalOpen(false)}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5 19 19M19 5 5 19" />
              </svg>
            </button>
            {!draftReady ? (
              <>
                <SectionLabel>Come see for yourself</SectionLabel>
                <h2 id="modal-title">YOUR NEXT STEP<br />STARTS HERE.</h2>
                <p className="modal-intro">Tell us a little about yourself and we will help you find your place at Fitness Care.</p>
                <form className="inquiry-form" onSubmit={handleInquirySubmit}>
                  <div className="form-row">
                    <label>
                      Your name
                      <input ref={firstInputRef} name="name" type="text" autoComplete="name" placeholder="Your name" required />
                    </label>
                    <label>
                      Email address
                      <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      I'm interested in
                      <select value={interest} onChange={(event) => setInterest(event.target.value)} name="interest">
                        <option>Not sure yet</option>
                        <option>Open Gym</option>
                        <option>All Access</option>
                      </select>
                    </label>
                    <label>
                      Best time to visit
                      <select name="visitTime" defaultValue="No preference">
                        <option>No preference</option>
                        <option>Weekday morning</option>
                        <option>Weekday afternoon</option>
                        <option>Weekday evening</option>
                        <option>Weekend</option>
                      </select>
                    </label>
                  </div>
                  <button className="button-primary form-submit" type="submit">Prepare my request <ArrowIcon size={18} /></button>
                  <p className="form-note">This opens a ready-to-send message in your email app. Sending it completes your request.</p>
                </form>
              </>
            ) : (
              <div className="modal-success">
                <SectionLabel>One step closer</SectionLabel>
                <h2 id="modal-title" ref={successHeadingRef} tabIndex={-1}>CHECK YOUR<br />EMAIL APP.</h2>
                <p>Your visit request is ready to send. Once you send the email, our team can get back to you.</p>
                <a className="button-primary" href={preparedMailto}>Open the draft again <ArrowIcon diagonal size={18} /></a>
                <p className="form-note">No email app? Write to <a href="mailto:hello@fitnesscare.com">hello@fitnesscare.com</a> instead.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
