"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const mosaicImages = [
  { src: "/home/mosaic-1.png", alt: "Student coding at a desk" },
  { src: "/home/mosaic-2.png", alt: "Tourism or cabin training" },
  { src: "/home/mosaic-3.png", alt: "Student working with cables and systems" },
  { src: "/home/mosaic-4.png", alt: "Bartending or beverage prep" },
  { src: "/home/mosaic-5.png", alt: "Culinary training with flames" },
  { src: "/home/mosaic-6.png", alt: "Business or finance planning" },
  { src: "/home/mosaic-7.png", alt: "Hospitality front desk" },
  { src: "/home/mosaic-8.png", alt: "Professional business handshake" },
];

const programs = [
  {
    title: "BS in Information Technology",
    short: "BSIT",
    image: "/home/program-it.png",
    color: "#D7A93A",
  },
  {
    title: "BS in Computer Engineering",
    short: "BSCPE",
    image: "/home/program-cpe.png",
    color: "#6B6B6B",
  },
  {
    title: "BS in Tourism Management",
    short: "BSTM",
    image: "/home/program-tourism.png",
    color: "#4869D6",
  },
  {
    title: "BS in Hospitality Management",
    short: "BSHM",
    image: "/home/program-hm.png",
    color: "#5D8752",
  },
  {
    title: "BS in Business Administration - Operations Management",
    short: "BSBA-OM",
    image: "/home/program-baom.png",
    color: "#CB4B4B",
    wide: true,
  },
];

const heroStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const sectionStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardParent = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 34, rotate: 1.5 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const mosaicItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function MosaicTile({ image, priority = false }) {
  return (
    <motion.div
      variants={mosaicItem}
      className="group relative aspect-[1.18/1] overflow-hidden [transform:translateZ(0)]"
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/[0.06]" />
    </motion.div>
  );
}

function HomePageMosaic() {
  const { scrollYProgress } = useScroll();

  const topRowX = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const bottomRowX = useTransform(scrollYProgress, [0, 1], [0, -18]);

  const topRow = mosaicImages.slice(0, 4);
  const bottomRow = mosaicImages.slice(4, 8);

  return (
    <section className="mx-auto max-w-[1600px] px-0">
      <div className="overflow-hidden rounded-[36px] border border-[#D7DEE3]">
        <motion.div
          variants={sectionStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div
            style={{ x: topRowX }}
            className="relative left-1/2 grid w-[104%] -translate-x-1/2 grid-cols-2 gap-0 md:grid-cols-4 will-change-transform"
          >
            {topRow.map((image, index) => (
              <MosaicTile
                key={image.src}
                image={image}
                priority={index < 2}
              />
            ))}
          </motion.div>

          <motion.div
            style={{ x: bottomRowX }}
            className="relative left-1/2 grid w-[104%] -translate-x-1/2 grid-cols-2 gap-0 md:grid-cols-4 will-change-transform"
          >
            {bottomRow.map((image) => (
              <MosaicTile key={image.src} image={image} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ProgramCard({ program }) {
  return (
    <article
      className={`w-full ${
        program.wide ? "max-w-[420px] sm:max-w-[460px] md:max-w-[500px]" : ""
      }`}
    >
      <div
        className="group relative overflow-hidden rounded-[28px] shadow-[0_18px_45px_rgba(17,24,39,0.14)] transition duration-300 hover:-translate-y-1"
        style={{ backgroundColor: program.color }}
      >
        <div className="absolute left-4 top-4 rounded-lg border border-black/20 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black/70">
          {program.short}
        </div>

        <div className="relative h-[190px] sm:h-[220px]">
          <Image
            src={program.image}
            alt={program.title}
            fill
            className="object-contain p-6 transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <p className="absolute bottom-4 right-4 text-[10px] font-medium text-white/80">
          browse listings
        </p>
      </div>

      <p className="mt-4 text-center text-[15px] font-semibold tracking-[-0.03em] text-[#111827] md:text-[16px]">
        {program.title}
      </p>
    </article>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();

  const heroImageY = useTransform(scrollYProgress, [0, 0.35], [0, -24]);
  const heroImageScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.03]);

  return (
    <main className="bg-[#ECEFF1] pb-20">
      <section className="mx-auto max-w-[1360px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[40px] bg-[#b3c0d1]/20">
          <div className="px-6 pt-12 text-center sm:px-10 sm:pt-16 lg:px-16 lg:pt-20">
            <motion.div
              className="mx-auto max-w-[820px]"
              variants={heroStagger}
              initial="hidden"
              animate="show"
            >
              <motion.h1
  variants={fadeUp}
  className="font-etna text-[clamp(2.4rem,4.8vw,4.9rem)] font-black leading-[1.08] tracking-[-0.01em] text-[#0B1115]"
>
  Your go-to skill
  <br />
  <span className="inline-block mt-1">exchange platform</span>
</motion.h1>

              <motion.p
  variants={fadeUp}
  className="font-qarvic mx-auto mt-6 max-w-[580px] text-[15px] leading-7 text-[#4B5563] sm:text-[17px]"
>
  Pool your skills. Engage with others. Learn something new.
</motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  href="/join"
                  className="font-qarvic mt-8 inline-flex rounded-2xl bg-[#3C4558] px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(60,69,88,0.18)] transition hover:translate-y-[-1px] hover:opacity-95"
                >
                  Join Skillpool
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            style={{ y: heroImageY, scale: heroImageScale }}
            className="mt-10 overflow-hidden"
          >
            <Image
              src="/home/hndshake.png"
              alt="Handshake representing collaboration"
              width={1800}
              height={760}
              priority
              className="block w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      <motion.section
        className="mx-auto max-w-[1100px] px-4 py-20 text-center sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={sectionStagger}
      >
        <motion.h2
          variants={fadeUp}
          className="font-etna text-[clamp(2.2rem,5vw,4.2rem)] font-black tracking-[-0.01em] text-[#0B1115]"
        >
          Share a skill.
          <br />
          Make it real.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-qarvic mx-auto mt-6 max-w-[640px] text-[15px] leading-7 text-[#5B6470] sm:text-[17px]"
        >
          A space where everyone has something to teach, and something to learn.
        </motion.p>
      </motion.section>

      <HomePageMosaic />

      <motion.section
        className="mx-auto max-w-[1160px] px-4 py-20 text-center sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardParent}
      >
        <motion.h2
          variants={fadeUp}
          className="font-etna text-[clamp(2.2rem,5vw,4rem)] font-black tracking-[-0.01em] text-[#0B1115]"
        >
          Explore listings for various
          <br />
          programs
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-qarvic mx-auto mt-6 max-w-[560px] text-[15px] leading-7 text-[#5B6470] sm:text-[17px]"
        >
          Teach something you know. Learn something you don’t.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 rounded-[40px] bg-[#b3c0d1]/20 px-6 py-10 sm:px-10 lg:px-14"
        >
          <motion.div className="grid gap-8 md:grid-cols-2" variants={cardParent}>
  {programs.map((program) => (
    <motion.div
      key={program.title}
      variants={cardItem}
      className={program.wide ? "md:col-span-2 flex justify-center" : ""}
    >
      <ProgramCard program={program} />
    </motion.div>
  ))}
</motion.div>
        </motion.div>
      </motion.section>
    </main>
  );
}