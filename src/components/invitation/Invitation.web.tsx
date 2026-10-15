import { useEffect, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { invitation, invitationFrame } from "./motion";
import { invitationStyles } from "./styles.web";

const closedArt = Asset.fromModule(
  require("../../../assets/invitation/envelope-reference.jpeg"),
).uri;
const openArt = Asset.fromModule(
  require("../../../assets/invitation/invitation-reference.jpeg"),
).uri;
const logo = Asset.fromModule(
  require("../../../assets/brand/eleva-burgundy.png"),
).uri;

function Artwork({
  source,
  crop,
  className,
}: {
  source: string;
  crop: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={crop}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <image href={source} width="709" height="1536" />
    </svg>
  );
}

function Letter({
  paperRef,
}: {
  paperRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <article
      className="invite-letter"
      ref={paperRef}
      aria-labelledby="invite-title"
    >
      <div className="invite-letter-inner">
        <h1 id="invite-title">
          {invitation.title}
          <em>{invitation.subtitle}</em>
        </h1>
        <p>{invitation.introduction}</p>
        <div className="invite-topics">
          <p>Uma experiência presencial que une:</p>
          <span>
            Wellness · Desenvolvimento pessoal
            <br />
            Posicionamento · Conexões
          </span>
        </div>
        <div className="invite-signature">
          <p>E o lançamento oficial do</p>
          <div>
            <img src={logo} alt="ELEVA" width="180" height="49.5" />
            <em>the club</em>
          </div>
        </div>
        <p>{invitation.closing}</p>
        <p className="invite-letter-date">
          24.10 <span aria-hidden="true">|</span> Vagas limitadas
        </p>
        <p className="invite-handwritten">Seu próximo nível começa aqui.</p>
      </div>
    </article>
  );
}

function Header({ onRead }: { onRead?: () => void }) {
  return (
    <header className="invite-header">
      <button
        className="invite-back"
        aria-label="Voltar à ELEVA"
        onClick={() => router.navigate("/")}
      >
        ‹
      </button>
      <img
        className="invite-brand"
        src={logo}
        width="100"
        height="27.5"
        alt="ELEVA"
      />
      {onRead ? (
        <button className="invite-read" onClick={onRead}>
          Ler convite
        </button>
      ) : (
        <span />
      )}
    </header>
  );
}

function Contact() {
  return (
    <a
      className="invite-contact"
      href={invitation.instagram}
      target="_blank"
      rel="noopener noreferrer"
    >
      Quero saber mais <span aria-hidden="true">↗</span>
      <span className="invite-sr">. Abre o Instagram em outra aba.</span>
    </a>
  );
}

function ReadableInvitation({ onReplay }: { onReplay?: () => void }) {
  return (
    <main className="invite-page invite-readable">
      <style>{invitationStyles}</style>
      <Header />
      <div className="invite-static-wrap">
        <Letter />
        <Contact />
        {onReplay && (
          <button className="invite-replay" onClick={onReplay}>
            Ver o envelope
          </button>
        )}
      </div>
    </main>
  );
}

function ImmersiveInvitation({ onRead }: { onRead: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ paper: 480, envelope: 240 });
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const { scrollYProgress } = useScroll({
    container,
    target: story,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { duration: 0.5, bounce: 0.2 });
  const frame = useTransform(progress, (p) =>
    invitationFrame(p, size.paper, size.envelope),
  );
  const camera = useTransform(
    frame,
    (f) => `translate3d(0, ${f.cameraY}px, 0)`,
  );
  const paper = useTransform(frame, (f) => `translate3d(0, ${f.paperY}px, 0)`);
  const seal = useTransform(
    frame,
    (f) =>
      `translate(-50%, -50%) translate3d(0, ${f.sealY}px, 5px) rotate(${f.sealRotation}deg)`,
  );
  const sealOpacity = useTransform(frame, (f) => f.sealOpacity);
  const flap = useTransform(frame, (f) => `rotateX(${f.flapRotation}deg)`);
  const flapZ = useTransform(frame, (f) => (f.flapBehind ? 1 : 5));
  const envelopeOpacity = useTransform(frame, (f) => f.envelopeOpacity);
  const hintOpacity = useTransform(frame, (f) => f.hintOpacity);
  const finalOpacity = useTransform(frame, (f) => f.finalOpacity);

  useEffect(() => {
    const measure = () => {
      container.current?.style.setProperty(
        "--invite-viewport",
        `${container.current.clientHeight}px`,
      );
      setSize({
        paper: paperRef.current?.offsetHeight || 480,
        envelope: envelopeRef.current?.offsetHeight || 240,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (container.current) observer.observe(container.current);
    if (paperRef.current) observer.observe(paperRef.current);
    if (envelopeRef.current) observer.observe(envelopeRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(
    () =>
      progress.on("change", (value) => {
        const next = value >= 0.97;
        // Only announce a completed state. No React renders during the gesture.
        if (openRef.current !== next) {
          openRef.current = next;
          setOpen(next);
        }
      }),
    [progress],
  );
  function reveal() {
    if (!container.current || !story.current) return;
    container.current.scrollTo({
      top: story.current.offsetHeight - container.current.clientHeight,
      behavior: "smooth",
    });
  }
  function replay() {
    container.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main
      className="invite-page"
      ref={container}
      aria-label="Convite de lançamento da ELEVA"
    >
      <style>{invitationStyles}</style>
      <section className="invite-story" ref={story}>
        <div className="invite-pinned">
          <Header onRead={onRead} />
          <div className="invite-scene">
            <div className="invite-anchor">
              <motion.div
                className="invite-envelope"
                style={{ transform: camera }}
                ref={envelopeRef}
              >
                <motion.div
                  className="invite-envelope-back invite-paper-grain"
                  style={{ opacity: envelopeOpacity }}
                  aria-hidden="true"
                >
                  <div className="invite-lining" />
                </motion.div>
                <div className="invite-letter-window">
                  <motion.div
                    style={{ transform: paper }}
                    className="invite-paper-track"
                  >
                    <Letter paperRef={paperRef} />
                  </motion.div>
                </div>
                <motion.div
                  className="invite-pocket"
                  style={{ opacity: envelopeOpacity }}
                  aria-hidden="true"
                >
                  <Artwork
                    source={openArt}
                    crop="50 728 589 375"
                    className="invite-pocket-art"
                  />
                </motion.div>
                <motion.div
                  className="invite-flap"
                  style={{
                    transform: flap,
                    zIndex: flapZ,
                    opacity: envelopeOpacity,
                  }}
                  aria-hidden="true"
                >
                  <div className="invite-flap-front invite-paper-grain" />
                  <div className="invite-flap-back" />
                </motion.div>
                <motion.div
                  className="invite-seal"
                  style={{ transform: seal, opacity: sealOpacity }}
                  aria-hidden="true"
                >
                  <Artwork source={closedArt} crop="250 630 210 210" />
                </motion.div>
              </motion.div>
            </div>
          </div>
          <motion.div
            className="invite-prompt"
            style={{ opacity: hintOpacity }}
          >
            <button onClick={reveal}>
              Arraste para abrir <span aria-hidden="true">↓</span>
            </button>
          </motion.div>
          <motion.div
            className="invite-final"
            style={{
              opacity: finalOpacity,
              pointerEvents: open ? "auto" : "none",
            }}
            aria-hidden={!open}
            inert={!open}
          >
            <Contact />
            <button className="invite-replay" onClick={replay}>
              Fechar o envelope
            </button>
          </motion.div>
          <span className="invite-sr" role="status">
            {open
              ? "Convite aberto."
              : "Role a página ou use Ler convite para abrir a carta."}
          </span>
        </div>
      </section>
    </main>
  );
}

export default function Invitation() {
  const reduced = useReducedMotion();
  const [readable, setReadable] = useState(false);
  useEffect(() => {
    document.title = "Um convite para você | ELEVA · 24.10";
    return () => {
      document.title = "ELEVA the club";
    };
  }, []);
  return reduced || readable ? (
    <ReadableInvitation
      onReplay={reduced ? undefined : () => setReadable(false)}
    />
  ) : (
    <ImmersiveInvitation onRead={() => setReadable(true)} />
  );
}
