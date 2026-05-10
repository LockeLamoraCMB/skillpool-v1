import Image from "next/image";

const topImages = [
  { src: "/about/about-1.png", alt: "Student working at a computer" },
  { src: "/about/about-2.png", alt: "Students in a professional kitchen" },
  { src: "/about/about-3.png", alt: "Student consultation" },
];

const midImages = [
  { src: "/about/about-4.png", alt: "Campus building" },
  { src: "/about/about-5.png", alt: "Students helping each other" },
  { src: "/about/about-6.png", alt: "Hands preparing a drink" },
];

const features = [
  {
    title: "Rating and Review System",
    text: "Students can leave a rating or review on other students after completing a project or tutoring service, helping others find the right match quickly.",
    bg: "bg-[#69C6DE]",
    image: "/about/feature-1.png",
  },
  {
    title: "Visual Skill Tags or Badges",
    text: "Display proficiency via user profile with customizable tags like “Java Expert” or “Top Performer”, which help showcase the most advanced in a specific field.",
    bg: "bg-[#45D10F]",
    image: "/about/feature-2.png",
  },
  {
    title: "Leaderboards",
    text: "Top students earn recognition through rankings, trophies, and badges based on ratings and completed projects, showcasing various expertise within our platform.",
    bg: "bg-[#D94747]",
    image: "/about/feature-3.png",
  },
  {
    title: "Tutoring and Skill Exchange",
    text: "Students can collaborate by teaching each other or exchanging skills to help complete a project, encouraging practical learning and peer experience.",
    bg: "bg-[#FFB400]",
    image: "/about/feature-4.png",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#EEF1F1] text-[#000100]">
      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        <div className="flex items-end justify-center gap-8 sm:gap-10 lg:gap-12">
  <p className="text-[clamp(2rem,6vw,4.4rem)] font-light italic leading-none tracking-tight">
    all about
  </p>

  <div className="relative translate-y-[10px] sm:translate-y-[12px] lg:translate-y-[14px] h-[52px] w-[230px] sm:h-[68px] sm:w-[300px] lg:h-[82px] lg:w-[360px]">
    <Image
      src="/about/about-logo.png"
      alt="Skillpool logo"
      fill
      className="object-contain object-left"
      priority
    />
  </div>
</div>

        <div className="mt-10 space-y-10">
          <div className="belt-viewport">
            <div className="belt-track belt-right">
              {[...topImages, ...topImages].map((image, index) => (
                <div key={`${image.src}-${index}`} className="belt-card group">
                  <div className="relative h-[220px] w-[340px] overflow-hidden rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,0.10)] sm:h-[240px] sm:w-[360px] lg:h-[260px] lg:w-[420px]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-115"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h1 className="font-etna mx-auto max-w-[700px] text-center text-3xl font-qarvic leading-tight sm:text-4xl lg:text-5xl">
            One platform—endless
            <br />
            student talent
          </h1>

          <div className="belt-viewport">
            <div className="belt-track belt-left">
              {[...midImages, ...midImages].map((image, index) => (
                <div key={`${image.src}-${index}`} className="belt-card group">
                  <div className="relative h-[220px] w-[340px] overflow-hidden rounded-[28px] shadow-[0_12px_30px_rgba(0,0,0,0.10)] sm:h-[240px] sm:w-[360px] lg:h-[260px] lg:w-[420px]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-115"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-[760px] space-y-8 text-justify font-['Qarvic'] text-[40px] leading-[1.2] text-black/90">
          <p>
            Skillpool is an online service marketplace that connects students
            who need work done with fellow students who have the skills to do it.
          </p>

          <p>
            Our peer to peer platform makes transactions smooth, secure, and
            affordable — all within the academic community.
          </p>

          <p>
            We believe students should not have to look far for help or
            opportunity. Whether you need academic assistance, tutoring,
            creative work, or basic programming, Skillpool makes it easy to
            find someone who can deliver.
          </p>

          <p>
            At its core, Skillpool is about empowering students — fostering
            entrepreneurship, independence, and collaboration in one shared space.
          </p>
        </div>

        <section className="mx-auto mt-20 max-w-[1100px] rounded-[40px] bg-[linear-gradient(180deg,#E6F2F4_0%,#DCECEF_100%)] px-6 py-12 sm:px-10 lg:px-14">
  <div className="text-center">
    <p className="font-etna text-[42px] leading-none text-[#0B1315] sm:text-[58px]">
      Mission <span className="mx-3 font-etna text-[36px] italic font-normal sm:text-[44px]">and</span> Vision
    </p>
    <p className="mx-auto mt-4 max-w-[700px] text-[15px] leading-7 text-black/60 sm:text-base">
      A student marketplace should feel inspiring and trustworthy. These
      two pillars guide how Skillpool grows as a platform and as a community.
    </p>
  </div>

  <div className="mt-14 grid gap-10 lg:grid-cols-2">
    <article className="relative overflow-visible rounded-[32px] border border-white/60 bg-white/70 px-7 pb-8 pt-24 shadow-[0_20px_45px_rgba(58,95,109,0.14)] backdrop-blur">
      <div className="absolute left-1/2 top-0 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#D4F1F5_0%,#A8D6DD_70%)] shadow-[0_18px_35px_rgba(69,120,135,0.22)] ring-1 ring-[#6E9DA7]/40 sm:h-[170px] sm:w-[170px]">
        <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full border border-[#5E8E99]/60 bg-[#BDE1E6]/70 sm:h-[146px] sm:w-[146px]">
          <Image
            src="/about/mission.png"
            alt="Mission icon"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-qarvic text-[32px] leading-none text-[#0B1315]">
          Mission
        </h3>
        <div className="mx-auto mt-4 h-[3px] w-16 rounded-full bg-[#7EA9B2]" />
      </div>

      <p className="font-qarvic mt-7 text-justify font-qarvic text-[15px] leading-8 text-black/75 sm:text-[16px]">
        Skillpool exists to give students a space where learning and earning can
        happen together. It aims to make skills more visible, opportunities more
        accessible, and collaboration more meaningful for every student who wants
        to grow.
      </p>
    </article>

    <article className="relative overflow-visible rounded-[32px] border border-white/60 bg-white/70 px-7 pb-8 pt-24 shadow-[0_20px_45px_rgba(58,95,109,0.14)] backdrop-blur">
      <div className="absolute left-1/2 top-0 flex h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#D4F1F5_0%,#A8D6DD_70%)] shadow-[0_18px_35px_rgba(69,120,135,0.22)] ring-1 ring-[#6E9DA7]/40 sm:h-[170px] sm:w-[170px]">
        <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full border border-[#5E8E99]/60 bg-[#BDE1E6]/70 sm:h-[146px] sm:w-[146px]">
          <Image
            src="/about/vision.png"
            alt="Vision icon"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <h3 className="font-qarvic text-[32px] leading-none text-[#0B1315]">
          Vision
        </h3>
        <div className="mx-auto mt-4 h-[3px] w-16 rounded-full bg-[#7EA9B2]" />
      </div>

      <p className="font-qarvic mt-7 text-justify font-qarvic text-[15px] leading-8 text-black/75 sm:text-[16px]">
        Skillpool envisions a connected student community where talent is shared
        openly, trust is built naturally, and peers can turn their abilities into
        real outcomes. It strives to become a campus platform that feels both
        creative and dependable.
      </p>
    </article>
  </div>
</section>
      </section>

      <section className="bg-[#000100] py-16">
  <div className="mx-auto max-w-[980px] px-5 sm:px-8">
    <h2 className="mb-10 text-center font-etna text-[44px] leading-tight text-white sm:text-[56px]">
      Product Features
    </h2>

    <div className="grid gap-8 md:grid-cols-2">
      {features.map((feature) => (
        <article
          key={feature.title}
          className={`flex min-h-[420px] flex-col overflow-hidden rounded-[28px] ${feature.bg} p-5 shadow-[0_15px_40px_rgba(0,0,0,0.22)]`}
        >
          <div className="px-1 pt-1">
            <h3 className="text-center font-qarvic text-[26px] leading-[1.1] text-white sm:text-[30px]">
              {feature.title}
            </h3>

            <p className="mt-3 w-full text-justify font-qarvic text-[14px] leading-[1.5] text-white/95 sm:text-[16px]">
              {feature.text}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-center pt-5">
            <div className="relative h-[230px] w-full overflow-hidden rounded-[22px]">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
      <section className="relative overflow-hidden bg-[#F2F3F3] py-20">
        <div className="absolute left-0 top-0 h-full w-[22%] bg-[linear-gradient(135deg,#d9dddf_0%,#f2f3f3_70%)]" />
        <div className="absolute right-0 top-0 h-full w-[25%] bg-[linear-gradient(315deg,#e9ecec_0%,#f2f3f3_70%)]" />

        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[420px] rounded-[28px] bg-[linear-gradient(135deg,#D9EEF0_0%,#7EA9B9_100%)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <h2 className="font-etna text-4xl font-black leading-tight text-[#000100]">
              Your next chapter
              <br />
              starts here.
            </h2>

           <p className="font-qarvic mt-5 text-[15px] italic leading-7 text-black/80">
  Whether you&apos;re looking to earn, grow, or simply put your
  skills to good use — Skillpool is where it begins.
</p>

            <a
              href="/join"
              className="font-qarvic mt-6 inline-flex rounded-full bg-[#000100] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Join Today
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}