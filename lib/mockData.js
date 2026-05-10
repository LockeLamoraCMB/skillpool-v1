export const forumTabs = [
  "All Posts",
  "Looking for Tutor",
  "Offering Service",
  "Completed",
  "Most Recent",
  "Most Active",
];

export const programs = [
  {
    id: "program-bsit",
    name: "BSIT",
    slug: "bsit",
    shortDescription: "Coding help, debugging, system builds, and digital project support.",
    description:
      "A fast-moving hub for students working on web systems, databases, UI mockups, and capstone deliverables.",
    courses: [
      {
        id: "course-web-systems",
        name: "Web Systems and Technologies",
        slug: "web-systems",
        description: "Frontend builds, backend basics, deployment, and debugging.",
      },
      {
        id: "course-database",
        name: "Database Management",
        slug: "database-management",
        description: "ERD design, SQL queries, normalization, and documentation.",
      },
      {
        id: "course-capstone",
        name: "Capstone Project",
        slug: "capstone-project",
        description: "UI prototypes, research posters, and system presentations.",
      },
    ],
  },
  {
    id: "program-bscpe",
    name: "BSCPE",
    slug: "bscpe",
    shortDescription: "Embedded systems, circuitry, lab support, and practical walkthroughs.",
    description:
      "For students handling simulations, hardware concepts, microcontrollers, and engineering documentation.",
    courses: [
      {
        id: "course-digital-logic",
        name: "Digital Logic Design",
        slug: "digital-logic-design",
        description: "Boolean algebra, logic gates, and timing diagrams.",
      },
      {
        id: "course-microprocessors",
        name: "Microprocessors",
        slug: "microprocessors",
        description: "Instruction sets, controller tasks, and lab prep support.",
      },
      {
        id: "course-embedded-systems",
        name: "Embedded Systems",
        slug: "embedded-systems",
        description: "Arduino, Proteus, sensors, and simulation-based help.",
      },
    ],
  },
  {
    id: "program-bstm",
    name: "BSTM",
    slug: "bstm",
    shortDescription: "Tourism decks, itinerary writing, captions, and event support.",
    description:
      "Built for travel planning outputs, destination marketing, expo materials, and presentation support.",
    courses: [
      {
        id: "course-tour-packaging",
        name: "Tour Packaging",
        slug: "tour-packaging",
        description: "Travel packages, costing, brochures, and trip proposals.",
      },
      {
        id: "course-agency-operations",
        name: "Travel Agency Operations",
        slug: "travel-agency-operations",
        description: "Ticketing basics, customer-facing workflows, and service tasks.",
      },
      {
        id: "course-destination-marketing",
        name: "Destination Marketing",
        slug: "destination-marketing",
        description: "Campaign mockups, social content, and tourism promotions.",
      },
    ],
  },
  {
    id: "program-bshm",
    name: "BSHM",
    slug: "bshm",
    shortDescription: "Hospitality tasks, menu boards, recipe costing, and event-ready outputs.",
    description:
      "A student marketplace for culinary worksheets, service role-plays, and hospitality presentation help.",
    courses: [
      {
        id: "course-fbs",
        name: "Food and Beverage Service",
        slug: "food-and-beverage-service",
        description: "Menu boards, service scripts, and restaurant-style training tasks.",
      },
      {
        id: "course-culinary",
        name: "Culinary Fundamentals",
        slug: "culinary-fundamentals",
        description: "Recipe costing, kitchen prep sheets, and plating feedback.",
      },
      {
        id: "course-hospitality-marketing",
        name: "Hospitality Marketing",
        slug: "hospitality-marketing",
        description: "Promotional materials, social content, and service branding outputs.",
      },
    ],
  },
  {
    id: "program-bsba-om",
    name: "BSBA-OM",
    slug: "bsba-om",
    shortDescription: "Dashboards, forms, process maps, and office-ready business support.",
    description:
      "Focused on operations tasks, workflow design, spreadsheet cleanups, and productivity-driven deliverables.",
    courses: [
      {
        id: "course-operations-analytics",
        name: "Operations Analytics",
        slug: "operations-analytics",
        description: "Dashboards, charts, reporting templates, and data summaries.",
      },
      {
        id: "course-office-productivity",
        name: "Office Productivity Systems",
        slug: "office-productivity-systems",
        description: "Forms, trackers, letters, and document layouts.",
      },
      {
        id: "course-business-process",
        name: "Business Process Management",
        slug: "business-process-management",
        description: "Workflow maps, SOPs, and process improvement visuals.",
      },
    ],
  },
];

export const courseForums = programs.flatMap((program) =>
  program.courses.map((course) => ({
    id: `${program.slug}-${course.slug}`,
    programSlug: program.slug,
    programName: program.name,
    courseName: course.name,
    courseSlug: course.slug,
    description: course.description,
  }))
);

export const badges = [
  {
    id: "badge-verified",
    name: "Verified Student",
    description: "Confirmed STI student account",
    icon: "✔",
    color: "#94C5CC",
  },
  {
    id: "badge-mentor",
    name: "Campus Mentor",
    description: "Frequently helps classmates with skill-based work",
    icon: "★",
    color: "#B4D2E7",
  },
  {
    id: "badge-fast",
    name: "Fast Responder",
    description: "Known for quick replies and smooth coordination",
    icon: "⚡",
    color: "#94C5CC",
  },
  {
    id: "badge-creative",
    name: "Creative Ace",
    description: "Trusted for graphics, decks, and visual outputs",
    icon: "✦",
    color: "#B4D2E7",
  },
  {
    id: "badge-top",
    name: "Top Tutor",
    description: "Ranks highly in completed sessions and reviews",
    icon: "🏆",
    color: "#94C5CC",
  },
  {
    id: "badge-helper",
    name: "Community Helper",
    description: "Often active in replies and peer support",
    icon: "💬",
    color: "#B4D2E7",
  },
];

export const students = [
  {
    id: "student-alyssa",
    fullName: "Alyssa Mendoza",
    username: "alysscodes",
    email: "alyssa.mendoza@skillpool.demo",
    programSlug: "bsit",
    program: "BSIT",
    yearLevel: "3rd Year",
    bio: "Frontend tutor who enjoys cleaning up interfaces, debugging projects, and helping classmates prep for demos.",
    headline: "Frontend tutor and UI helper",
    isVerified: true,
    responseTime: "Usually replies in 12 mins",
    averageRating: 4.9,
    reviewCount: 18,
    completedRequests: 32,
    preferredMeetup: "Online",
    badges: ["Verified Student", "Top Tutor", "Fast Responder"],
  },
  {
    id: "student-carlo",
    fullName: "Carlo Reyes",
    username: "circuitcarlo",
    email: "carlo.reyes@skillpool.demo",
    programSlug: "bscpe",
    program: "BSCPE",
    yearLevel: "4th Year",
    bio: "Microcontroller and simulation buddy for practicals, diagrams, and lab prep sessions.",
    headline: "Embedded systems guide",
    isVerified: true,
    responseTime: "Usually replies in 18 mins",
    averageRating: 4.8,
    reviewCount: 12,
    completedRequests: 27,
    preferredMeetup: "Both",
    badges: ["Verified Student", "Campus Mentor", "Community Helper"],
  },
  {
    id: "student-bea",
    fullName: "Bea Santos",
    username: "beatravels",
    email: "bea.santos@skillpool.demo",
    programSlug: "bstm",
    program: "BSTM",
    yearLevel: "3rd Year",
    bio: "Tourism student creating polished itineraries, brochures, destination decks, and event copy.",
    headline: "Tourism visuals and itinerary support",
    isVerified: true,
    responseTime: "Usually replies in 25 mins",
    averageRating: 4.7,
    reviewCount: 15,
    completedRequests: 20,
    preferredMeetup: "Online",
    badges: ["Verified Student", "Creative Ace"],
  },
  {
    id: "student-mia",
    fullName: "Mia Dela Cruz",
    username: "miahosts",
    email: "mia.delacruz@skillpool.demo",
    programSlug: "bshm",
    program: "BSHM",
    yearLevel: "2nd Year",
    bio: "Focused on hospitality service outputs, menu design requests, and presentation support for practicals.",
    headline: "Hospitality client and collaborator",
    isVerified: true,
    responseTime: "Usually replies in 30 mins",
    averageRating: 4.6,
    reviewCount: 8,
    completedRequests: 11,
    preferredMeetup: "Face-to-face",
    badges: ["Verified Student"],
  },
  {
    id: "student-jessa",
    fullName: "Jessa Ramirez",
    username: "jessapivots",
    email: "jessa.ramirez@skillpool.demo",
    programSlug: "bsba-om",
    program: "BSBA-OM",
    yearLevel: "4th Year",
    bio: "Spreadsheet builder for dashboards, inventory logs, trackers, and office-ready templates.",
    headline: "Operations dashboards and documents",
    isVerified: true,
    responseTime: "Usually replies in 15 mins",
    averageRating: 4.9,
    reviewCount: 14,
    completedRequests: 24,
    preferredMeetup: "Both",
    badges: ["Verified Student", "Fast Responder", "Top Tutor"],
  },
  {
    id: "student-noah",
    fullName: "Noah Villanueva",
    username: "noahbuilds",
    email: "noah.villanueva@skillpool.demo",
    programSlug: "bsit",
    program: "BSIT",
    yearLevel: "4th Year",
    bio: "Capstone teammate-for-hire for clickable prototypes, pitch flow, and project documentation.",
    headline: "Capstone UI and product story support",
    isVerified: true,
    responseTime: "Usually replies in 22 mins",
    averageRating: 4.8,
    reviewCount: 10,
    completedRequests: 19,
    preferredMeetup: "Online",
    badges: ["Verified Student", "Community Helper"],
  },
  {
    id: "student-trisha",
    fullName: "Trisha Flores",
    username: "trishasolder",
    email: "trisha.flores@skillpool.demo",
    programSlug: "bscpe",
    program: "BSCPE",
    yearLevel: "3rd Year",
    bio: "Hands-on tutor for circuit explanations, microprocessor review sessions, and lab troubleshooting.",
    headline: "Lab walkthrough tutor",
    isVerified: true,
    responseTime: "Usually replies in 19 mins",
    averageRating: 4.8,
    reviewCount: 9,
    completedRequests: 17,
    preferredMeetup: "Face-to-face",
    badges: ["Verified Student", "Campus Mentor"],
  },
  {
    id: "student-paolo",
    fullName: "Paolo Garcia",
    username: "paoloplans",
    email: "paolo.garcia@skillpool.demo",
    programSlug: "bsba-om",
    program: "BSBA-OM",
    yearLevel: "2nd Year",
    bio: "Often posts workflow requests, process maps, and business document collaboration needs.",
    headline: "Process mapping and presentation requests",
    isVerified: true,
    responseTime: "Usually replies in 40 mins",
    averageRating: 4.5,
    reviewCount: 6,
    completedRequests: 7,
    preferredMeetup: "Online",
    badges: ["Verified Student"],
  },
  {
    id: "student-lance",
    fullName: "Lance Aquino",
    username: "lancekitchen",
    email: "lance.aquino@skillpool.demo",
    programSlug: "bshm",
    program: "BSHM",
    yearLevel: "3rd Year",
    bio: "Recipe costing helper and hospitality student who enjoys sharing clean templates and practical tips.",
    headline: "Costing sheets and kitchen workflow help",
    isVerified: true,
    responseTime: "Usually replies in 17 mins",
    averageRating: 4.7,
    reviewCount: 11,
    completedRequests: 16,
    preferredMeetup: "Both",
    badges: ["Verified Student", "Community Helper"],
  },
  {
    id: "student-danica",
    fullName: "Danica Perez",
    username: "danicadesigns",
    email: "danica.perez@skillpool.demo",
    programSlug: "bstm",
    program: "BSTM",
    yearLevel: "2nd Year",
    bio: "Creates posters, booth captions, tourism visuals, and event-ready graphic layouts.",
    headline: "Poster layouts and caption writing",
    isVerified: true,
    responseTime: "Usually replies in 21 mins",
    averageRating: 4.8,
    reviewCount: 13,
    completedRequests: 21,
    preferredMeetup: "Online",
    badges: ["Verified Student", "Creative Ace"],
  },
];

export const userBadges = [
  { id: "ub-1", userId: "student-alyssa", badgeId: "badge-verified", awardedAt: "2026-02-10" },
  { id: "ub-2", userId: "student-alyssa", badgeId: "badge-top", awardedAt: "2026-03-18" },
  { id: "ub-3", userId: "student-alyssa", badgeId: "badge-fast", awardedAt: "2026-03-20" },
  { id: "ub-4", userId: "student-carlo", badgeId: "badge-verified", awardedAt: "2026-01-20" },
  { id: "ub-5", userId: "student-carlo", badgeId: "badge-mentor", awardedAt: "2026-02-14" },
  { id: "ub-6", userId: "student-carlo", badgeId: "badge-helper", awardedAt: "2026-03-10" },
  { id: "ub-7", userId: "student-bea", badgeId: "badge-verified", awardedAt: "2026-02-22" },
  { id: "ub-8", userId: "student-bea", badgeId: "badge-creative", awardedAt: "2026-03-11" },
  { id: "ub-9", userId: "student-jessa", badgeId: "badge-verified", awardedAt: "2026-01-18" },
  { id: "ub-10", userId: "student-jessa", badgeId: "badge-fast", awardedAt: "2026-03-05" },
  { id: "ub-11", userId: "student-jessa", badgeId: "badge-top", awardedAt: "2026-03-21" },
  { id: "ub-12", userId: "student-danica", badgeId: "badge-verified", awardedAt: "2026-02-08" },
  { id: "ub-13", userId: "student-danica", badgeId: "badge-creative", awardedAt: "2026-03-07" },
];

export const listings = [
  {
    id: "listing-web-debug",
    userId: "student-alyssa",
    programId: "program-bsit",
    programSlug: "bsit",
    courseId: "course-web-systems",
    courseSlug: "web-systems",
    courseName: "Web Systems and Technologies",
    roleType: "Tutor",
    title: "I can help debug your HTML, CSS, and JavaScript finals project",
    description:
      "Ideal for classmates who need layout fixes, mobile responsiveness, broken interactions, or cleaner code before checking.",
    fullDescription:
      "I can help you clean up a web project before submission or demo day. This includes fixing layout issues, improving responsiveness, checking broken buttons or form behavior, and organizing your HTML, CSS, or JavaScript files so your output looks more polished.\n\nThis works well for quick rescue sessions, especially when your project is almost done but still feels messy or inconsistent on mobile. We can review your problem live, or you can send screenshots and files first so I can point out what to improve.\n\nGood fit for finals week, practicals, and project consultations. If you want help with Firebase, CRUD flow, or a presentation walkthrough, we can also include that depending on scope.",
    price: 250,
    priceLabel: "₱250 / hour",
    meetupOption: "Online",
    status: "Open",
    postedMinutesAgo: 12,
    postedLabel: "12 mins ago",
    rating: 4.9,
    reviewCount: 18,
    replyCount: 14,
    isPinned: true,
    views: 168,
    locationLabel: "Google Meet or Messenger call",
    tags: ["Frontend", "Debugging", "Project Rescue"],
  },
  {
    id: "listing-arduino-help",
    userId: "student-carlo",
    programId: "program-bscpe",
    programSlug: "bscpe",
    courseId: "course-embedded-systems",
    courseSlug: "embedded-systems",
    courseName: "Embedded Systems",
    roleType: "Client",
    title: "Need a tutor for Arduino plus Proteus simulation before Friday",
    description:
      "Looking for someone patient who can explain sensor flow, pin mapping, and how to present the simulation clearly.",
    fullDescription:
      "I need help reviewing an embedded systems task involving Arduino logic and a Proteus simulation. The main issue is understanding the sensor sequence and why my current setup is not responding the way the guide expects.\n\nI would prefer a tutor who can explain the concept, not just send the output. A short walkthrough plus a final check of my simulation would already help a lot.\n\nFace-to-face in campus is okay, but online is also fine if you can screen share and explain the setup clearly.",
    price: 400,
    priceLabel: "₱400 fixed",
    meetupOption: "Both",
    status: "Open",
    postedMinutesAgo: 34,
    postedLabel: "34 mins ago",
    rating: 4.8,
    reviewCount: 12,
    replyCount: 9,
    isPinned: true,
    views: 142,
    locationLabel: "Campus library or online call",
    tags: ["Arduino", "Proteus", "Urgent Review"],
  },
  {
    id: "listing-tourism-decks",
    userId: "student-bea",
    programId: "program-bstm",
    programSlug: "bstm",
    courseId: "course-tour-packaging",
    courseSlug: "tour-packaging",
    courseName: "Tour Packaging",
    roleType: "Tutor",
    title: "Travel itinerary decks, brochures, and pitch slides for tourism subjects",
    description:
      "Helping BSTM students turn rough notes into clean itinerary decks, promo boards, and presentation-ready packs.",
    fullDescription:
      "If you already have a destination, schedule, and basic package details, I can help turn them into a more polished tourism output. I usually help with itinerary formatting, brochure copy, simple layout direction, and presentation flow.\n\nThis is useful for students who have the content already but want it to look stronger and easier to present. I can also help reduce clutter and make the final file feel more professional without making it too corporate or off-brand for school use.\n\nBest for class decks, expo materials, destination marketing outputs, and travel service mockups.",
    price: 350,
    priceLabel: "₱350 / pack",
    meetupOption: "Online",
    status: "Open",
    postedMinutesAgo: 58,
    postedLabel: "58 mins ago",
    rating: 4.7,
    reviewCount: 15,
    replyCount: 11,
    isPinned: false,
    views: 109,
    locationLabel: "Online turnaround via shared folder",
    tags: ["Tourism", "Deck Design", "Brochure"],
  },
  {
    id: "listing-menu-board",
    userId: "student-mia",
    programId: "program-bshm",
    programSlug: "bshm",
    courseId: "course-fbs",
    courseSlug: "food-and-beverage-service",
    courseName: "Food and Beverage Service",
    roleType: "Client",
    title: "Looking for help with menu board design and costing sheet",
    description:
      "Need a classmate who can make the menu board look presentable and align it with a simple costing worksheet.",
    fullDescription:
      "I already have the menu concept and rough food names, but the layout still looks too plain for our class presentation. I also need a matching costing sheet that is easy to read and not overloaded.\n\nA clean Canva layout plus a simple spreadsheet template would be enough. I prefer someone who can explain the structure so I can still edit it after.\n\nThis can be handled online first, then checked face-to-face if needed before submission.",
    price: 500,
    priceLabel: "₱500 fixed",
    meetupOption: "Face-to-face",
    status: "Open",
    postedMinutesAgo: 74,
    postedLabel: "1 hr ago",
    rating: 4.6,
    reviewCount: 8,
    replyCount: 7,
    isPinned: false,
    views: 86,
    locationLabel: "STI Carmona cafeteria area",
    tags: ["Menu Board", "Costing Sheet", "Canva"],
  },
  {
    id: "listing-dashboard-help",
    userId: "student-jessa",
    programId: "program-bsba-om",
    programSlug: "bsba-om",
    courseId: "course-operations-analytics",
    courseSlug: "operations-analytics",
    courseName: "Operations Analytics",
    roleType: "Tutor",
    title: "Excel dashboards, inventory sheets, and office forms done cleanly",
    description:
      "For classmates who need business-ready sheets with cleaner formulas, formatting, charts, and presentation polish.",
    fullDescription:
      "I can help build or clean up a spreadsheet-based output for reports, dashboards, inventory monitoring, or office-style forms. I focus on making the sheet readable, consistent, and easy to explain in class.\n\nThis is useful if your current file works but still looks too raw, or if you need help turning a requirement into a more organized output. I can also help with chart setup, summary tables, and formatting for printed submissions.\n\nFor V1 scope, most requests are done through shared files and a short walkthrough if needed.",
    price: 300,
    priceLabel: "₱300 / sheet",
    meetupOption: "Both",
    status: "Open",
    postedMinutesAgo: 20,
    postedLabel: "20 mins ago",
    rating: 4.9,
    reviewCount: 14,
    replyCount: 16,
    isPinned: true,
    views: 176,
    locationLabel: "Google Meet or campus study area",
    tags: ["Excel", "Dashboards", "Reports"],
  },
  {
    id: "listing-capstone-ui",
    userId: "student-noah",
    programId: "program-bsit",
    programSlug: "bsit",
    courseId: "course-capstone",
    courseSlug: "capstone-project",
    courseName: "Capstone Project",
    roleType: "Client",
    title: "Need UI mockups and clickable prototype for capstone defense",
    description:
      "Looking for someone who can turn our wireframe into a cleaner prototype with smoother presentation flow.",
    fullDescription:
      "Our group already has the content and main modules, but the UI still looks too rough for defense. We need help improving the screens, making the navigation clearer, and preparing a more confident product walkthrough.\n\nA clickable prototype is preferred so we can present the user journey even if some parts of the system are still under development.\n\nThis post is marked completed because we already found a collaborator through Skillpool, but I left it visible so other students can see a sample capstone request format.",
    price: 800,
    priceLabel: "₱800 fixed",
    meetupOption: "Online",
    status: "Completed",
    postedMinutesAgo: 160,
    postedLabel: "2 hrs ago",
    rating: 4.8,
    reviewCount: 10,
    replyCount: 19,
    isPinned: false,
    views: 214,
    locationLabel: "Online files and feedback sessions",
    tags: ["UI/UX", "Prototype", "Capstone"],
  },
  {
    id: "listing-microprocessor-tutor",
    userId: "student-trisha",
    programId: "program-bscpe",
    programSlug: "bscpe",
    courseId: "course-microprocessors",
    courseSlug: "microprocessors",
    courseName: "Microprocessors",
    roleType: "Tutor",
    title: "Microcontroller concept walkthroughs for labs and practicals",
    description:
      "Offering review sessions for classmates who need help understanding instruction flow, lab tasks, and practical prep.",
    fullDescription:
      "I offer focused tutoring for students who want a calmer walkthrough of microprocessor topics before a practical, quiz, or lab check. Sessions can include concept explanation, sample exercises, and guidance on what to emphasize during presentation.\n\nI usually work best with students who already have their module or lab sheet ready so we can work directly on the weak areas.\n\nFace-to-face sessions are ideal for diagrams and quick troubleshooting, but I can also do online recap support.",
    price: 300,
    priceLabel: "₱300 / session",
    meetupOption: "Face-to-face",
    status: "Open",
    postedMinutesAgo: 92,
    postedLabel: "1 hr ago",
    rating: 4.8,
    reviewCount: 9,
    replyCount: 10,
    isPinned: false,
    views: 123,
    locationLabel: "Campus library discussion table",
    tags: ["Lab Review", "Microprocessors", "Face-to-face"],
  },
  {
    id: "listing-process-map",
    userId: "student-paolo",
    programId: "program-bsba-om",
    programSlug: "bsba-om",
    courseId: "course-business-process",
    courseSlug: "business-process-management",
    courseName: "Business Process Management",
    roleType: "Client",
    title: "Need a simple business process flowchart and short presentation script",
    description:
      "Our task needs a cleaner process map plus a short explanation we can confidently deliver in class.",
    fullDescription:
      "We already drafted the steps, but the flowchart still feels cluttered and hard to follow. I need help turning it into something cleaner, plus a short script or talking points for the report.\n\nThis is best for someone who understands how to simplify steps without removing important details.\n\nOnline setup is okay as long as the files are editable after turnover.",
    price: 450,
    priceLabel: "₱450 fixed",
    meetupOption: "Online",
    status: "Open",
    postedMinutesAgo: 48,
    postedLabel: "48 mins ago",
    rating: 4.5,
    reviewCount: 6,
    replyCount: 8,
    isPinned: false,
    views: 97,
    locationLabel: "Shared docs and async review",
    tags: ["Flowchart", "Script", "Business Process"],
  },
  {
    id: "listing-recipe-costing",
    userId: "student-lance",
    programId: "program-bshm",
    programSlug: "bshm",
    courseId: "course-culinary",
    courseSlug: "culinary-fundamentals",
    courseName: "Culinary Fundamentals",
    roleType: "Tutor",
    title: "Recipe costing templates, plating feedback, and kitchen workflow tips",
    description:
      "Helping classmates prepare cleaner costing sheets and practical-ready culinary outputs without overcomplicating them.",
    fullDescription:
      "I can share a recipe costing template, check ingredient breakdowns, and help improve how your workflow looks on paper for culinary and practical requirements.\n\nI also give simple feedback on plating presentation if you already have photos or sample ideas.\n\nBest for students who want a neat, usable template and a practical review before performance tasks.",
    price: 280,
    priceLabel: "₱280 / consult",
    meetupOption: "Both",
    status: "Open",
    postedMinutesAgo: 108,
    postedLabel: "1 hr ago",
    rating: 4.7,
    reviewCount: 11,
    replyCount: 6,
    isPinned: false,
    views: 90,
    locationLabel: "Online or quick campus review",
    tags: ["Costing", "Culinary", "Template"],
  },
  {
    id: "listing-tourism-poster",
    userId: "student-danica",
    programId: "program-bstm",
    programSlug: "bstm",
    courseId: "course-destination-marketing",
    courseSlug: "destination-marketing",
    courseName: "Destination Marketing",
    roleType: "Tutor",
    title: "Posters, social captions, and booth visuals for tourism expo tasks",
    description:
      "For classmates who need cleaner event visuals, short promo captions, and a more coordinated tourism presentation set.",
    fullDescription:
      "I can help with tourism-themed posters, social copy, booth captions, and basic layout cleanup for campus expo and marketing outputs.\n\nThis is a good fit if you have the concept already but want the final output to feel more organized and audience-friendly.\n\nI can work through Canva or any editable file that is easy for your group to update later.",
    price: 320,
    priceLabel: "₱320 / layout",
    meetupOption: "Online",
    status: "Open",
    postedMinutesAgo: 66,
    postedLabel: "1 hr ago",
    rating: 4.8,
    reviewCount: 13,
    replyCount: 12,
    isPinned: false,
    views: 118,
    locationLabel: "Online only",
    tags: ["Poster Layout", "Captions", "Expo"],
  },
];

export const replies = [
  {
    id: "reply-1",
    listingId: "listing-web-debug",
    userId: "student-noah",
    content: "Interested. Can you also check responsive navigation and a login form flow for a capstone web app?",
    createdAtLabel: "6 mins ago",
  },
  {
    id: "reply-2",
    listingId: "listing-web-debug",
    userId: "student-jessa",
    content: "Up for this. Alyssa helped my dashboard styling before and explained things clearly.",
    createdAtLabel: "5 mins ago",
  },
  {
    id: "reply-3",
    listingId: "listing-arduino-help",
    userId: "student-trisha",
    content: "I can do a concept-first review session tomorrow after lunch. Bring the lab sheet and current simulation file.",
    createdAtLabel: "14 mins ago",
  },
  {
    id: "reply-4",
    listingId: "listing-arduino-help",
    userId: "student-carlo",
    content: "That works. I mostly need help explaining the sensor logic during reporting.",
    createdAtLabel: "10 mins ago",
  },
  {
    id: "reply-5",
    listingId: "listing-tourism-decks",
    userId: "student-danica",
    content: "Can confirm Bea is great for tightening up itinerary decks and making them feel more premium.",
    createdAtLabel: "23 mins ago",
  },
  {
    id: "reply-6",
    listingId: "listing-menu-board",
    userId: "student-lance",
    content: "I can help with the costing side and align the menu formatting so it matches your concept.",
    createdAtLabel: "18 mins ago",
  },
  {
    id: "reply-7",
    listingId: "listing-dashboard-help",
    userId: "student-paolo",
    content: "Need this for an inventory tracker. Do you also help with summary charts for presentations?",
    createdAtLabel: "9 mins ago",
  },
  {
    id: "reply-8",
    listingId: "listing-dashboard-help",
    userId: "student-jessa",
    content: "Yes, especially if the data is already complete. I can turn it into cleaner chart cards and a printable summary.",
    createdAtLabel: "8 mins ago",
  },
  {
    id: "reply-9",
    listingId: "listing-capstone-ui",
    userId: "student-alyssa",
    content: "Glad this one got completed. The prototype flow looked much better after simplifying the screens.",
    createdAtLabel: "1 day ago",
  },
  {
    id: "reply-10",
    listingId: "listing-microprocessor-tutor",
    userId: "student-carlo",
    content: "Recommended for lab prep. Trisha is good at making hard topics feel less intimidating.",
    createdAtLabel: "30 mins ago",
  },
  {
    id: "reply-11",
    listingId: "listing-process-map",
    userId: "student-jessa",
    content: "I can help simplify the process map and keep the handoff editable in PowerPoint or Docs.",
    createdAtLabel: "16 mins ago",
  },
  {
    id: "reply-12",
    listingId: "listing-recipe-costing",
    userId: "student-mia",
    content: "Interested. Do you have a version that also shows portion yield and serving cost?",
    createdAtLabel: "22 mins ago",
  },
  {
    id: "reply-13",
    listingId: "listing-tourism-poster",
    userId: "student-bea",
    content: "Danica’s layouts are clean and easy to present. Great for destination marketing boards.",
    createdAtLabel: "19 mins ago",
  },
  {
    id: "reply-14",
    listingId: "listing-tourism-poster",
    userId: "student-danica",
    content: "Thanks! I can also bundle short captions if the class output needs a social media angle.",
    createdAtLabel: "15 mins ago",
  },
];

export const reviews = [
  {
    id: "review-1",
    reviewerId: "student-noah",
    revieweeId: "student-alyssa",
    listingId: "listing-web-debug",
    rating: 5,
    comment: "Fast, clear, and very practical. The mobile layout finally made sense after one session.",
    createdAtLabel: "2 days ago",
  },
  {
    id: "review-2",
    reviewerId: "student-paolo",
    revieweeId: "student-jessa",
    listingId: "listing-dashboard-help",
    rating: 5,
    comment: "Our dashboard looked cleaner and easier to explain. Good balance of design and formulas.",
    createdAtLabel: "4 days ago",
  },
  {
    id: "review-3",
    reviewerId: "student-bea",
    revieweeId: "student-danica",
    listingId: "listing-tourism-poster",
    rating: 5,
    comment: "Poster and captions matched the event mood really well. Easy to revise too.",
    createdAtLabel: "1 week ago",
  },
  {
    id: "review-4",
    reviewerId: "student-carlo",
    revieweeId: "student-trisha",
    listingId: "listing-microprocessor-tutor",
    rating: 4.8,
    comment: "Great lab prep session. Explanations were calm and not rushed.",
    createdAtLabel: "5 days ago",
  },
  {
    id: "review-5",
    reviewerId: "student-mia",
    revieweeId: "student-lance",
    listingId: "listing-recipe-costing",
    rating: 4.7,
    comment: "The costing sheet was simple but complete. It helped me finish faster.",
    createdAtLabel: "6 days ago",
  },
  {
    id: "review-6",
    reviewerId: "student-danica",
    revieweeId: "student-bea",
    listingId: "listing-tourism-decks",
    rating: 4.9,
    comment: "Very polished tourism deck output. Good pacing and cleaner hierarchy.",
    createdAtLabel: "3 days ago",
  },
  {
    id: "review-7",
    reviewerId: "student-alyssa",
    revieweeId: "student-noah",
    listingId: "listing-capstone-ui",
    rating: 4.8,
    comment: "Great collaborator for prototype flow and presentation structure.",
    createdAtLabel: "1 week ago",
  },
  {
    id: "review-8",
    reviewerId: "student-paolo",
    revieweeId: "student-carlo",
    listingId: "listing-arduino-help",
    rating: 4.7,
    comment: "Helpful client, shared files early, and communication was smooth.",
    createdAtLabel: "2 weeks ago",
  },
];

export const leaderboardStats = [
  {
    id: "leader-1",
    rank: 1,
    userId: "student-alyssa",
    completedRequests: 32,
    averageRating: 4.9,
    replyCount: 96,
    score: 980,
    updatedAtLabel: "Updated today",
  },
  {
    id: "leader-2",
    rank: 2,
    userId: "student-jessa",
    completedRequests: 24,
    averageRating: 4.9,
    replyCount: 78,
    score: 910,
    updatedAtLabel: "Updated today",
  },
  {
    id: "leader-3",
    rank: 3,
    userId: "student-carlo",
    completedRequests: 27,
    averageRating: 4.8,
    replyCount: 82,
    score: 888,
    updatedAtLabel: "Updated today",
  },
  {
    id: "leader-4",
    rank: 4,
    userId: "student-danica",
    completedRequests: 21,
    averageRating: 4.8,
    replyCount: 71,
    score: 852,
    updatedAtLabel: "Updated today",
  },
  {
    id: "leader-5",
    rank: 5,
    userId: "student-bea",
    completedRequests: 20,
    averageRating: 4.7,
    replyCount: 67,
    score: 830,
    updatedAtLabel: "Updated today",
  },
  {
    id: "leader-6",
    rank: 6,
    userId: "student-trisha",
    completedRequests: 17,
    averageRating: 4.8,
    replyCount: 61,
    score: 788,
    updatedAtLabel: "Updated today",
  },
];

export const communityStats = [
  { label: "Verified students", value: "180+" },
  { label: "Open listings", value: "46" },
  { label: "Completed matches", value: "320+" },
  { label: "Avg. response", value: "< 20 mins" },
];

export const homeFeatures = [
  {
    title: "Student-only access",
    description:
      "Designed for STI students with verified access, campus context, and familiar academic needs.",
    icon: "shield",
  },
  {
    title: "Marketplace-style discovery",
    description:
      "Browse tutors, request help, compare offers, and find the right classmate for the task.",
    icon: "search",
  },
  {
    title: "Forum-style browsing",
    description:
      "Explore active categories, latest posts, pinned discussions, and community-driven listings.",
    icon: "forum",
  },
  {
    title: "Trust through proof",
    description:
      "Ratings, reviews, badges, and leaderboard visibility help students choose with confidence.",
    icon: "star",
  },
  {
    title: "Easy posting flow",
    description:
      "Post as a tutor or client and keep requests simple enough for quick campus collaboration.",
    icon: "bolt",
  },
  {
    title: "Built for mixed skills",
    description:
      "Support tutoring, creative tasks, multimedia work, and basic programming help in one hub.",
    icon: "sparkles",
  },
];

export const aboutHighlights = [
  {
    title: "Made for real student needs",
    description:
      "Skillpool exists for classmates who need fast, trustworthy support without leaving the campus community.",
    icon: "campus",
  },
  {
    title: "A safer way to collaborate",
    description:
      "Verified access and visible reputation make it easier to coordinate help with less uncertainty.",
    icon: "shield",
  },
  {
    title: "A place to grow skills",
    description:
      "Students can earn through tutoring, build a reputation, and gain visibility through helpful work.",
    icon: "growth",
  },
  {
    title: "A stronger community loop",
    description:
      "The forum feel keeps the platform alive with discussion, updates, trends, and peer-to-peer support.",
    icon: "people",
  },
];

export const announcements = [
  {
    id: "announce-1",
    title: "Microsoft sign-in rolls out for verified students",
    label: "New",
    summary: "Prepare your STI student account details for the V1 launch flow.",
  },
  {
    id: "announce-2",
    title: "Top Tutor badges refresh every month",
    label: "Leaderboard",
    summary: "Badge placement is based on completed sessions, rating, and helpful forum activity.",
  },
  {
    id: "announce-3",
    title: "Capstone and finals categories now highlighted",
    label: "Update",
    summary: "Pinned threads can now showcase urgent finals-week requests and tutoring offers.",
  },
];

export const latestActivity = [
  { id: "activity-1", text: "Alyssa Mendoza replied to a BSIT debugging request", time: "5 mins ago" },
  { id: "activity-2", text: "New BSCPE embedded systems request posted", time: "12 mins ago" },
  { id: "activity-3", text: "Jessa Ramirez climbed to #2 on the leaderboard", time: "28 mins ago" },
  { id: "activity-4", text: "Danica Perez earned a Creative Ace badge", time: "1 hr ago" },
  { id: "activity-5", text: "A capstone prototype request was marked completed", time: "2 hrs ago" },
];

export const topBadges = [
  { id: "top-badge-1", name: "Verified Student", count: 48 },
  { id: "top-badge-2", name: "Top Tutor", count: 14 },
  { id: "top-badge-3", name: "Fast Responder", count: 16 },
  { id: "top-badge-4", name: "Creative Ace", count: 11 },
];

export const trendingDiscussions = [
  {
    id: "trend-1",
    title: "Best way to present capstone dashboards in 5 minutes",
    replies: 21,
    programSlug: "bsit",
  },
  {
    id: "trend-2",
    title: "Arduino practical tips that actually help before checkoff",
    replies: 18,
    programSlug: "bscpe",
  },
  {
    id: "trend-3",
    title: "Tourism expo boards: Canva layout or PowerPoint first?",
    replies: 15,
    programSlug: "bstm",
  },
  {
    id: "trend-4",
    title: "Recipe costing shortcuts that still look clean in class",
    replies: 13,
    programSlug: "bshm",
  },
];

export const heroHighlights = [
  "Tutoring that feels campus-ready",
  "Creative and multimedia task support",
  "Simple job posting for clients and tutors",
];

export const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/forum", label: "Forum" },
  { href: "/join", label: "Join Us" },
];

export function getProgramBySlug(slug) {
  return programs.find((program) => program.slug === slug);
}

export function getStudentById(id) {
  return students.find((student) => student.id === id);
}

export function getStudentByUsername(username) {
  return students.find((student) => student.username === username);
}

export function getListingById(id) {
  return listings.find((listing) => listing.id === id);
}

export function getRepliesByListingId(listingId) {
  return replies.filter((reply) => reply.listingId === listingId);
}

export function getReviewsByListingId(listingId) {
  return reviews.filter((review) => review.listingId === listingId);
}

export function getReviewsForUser(userId) {
  return reviews.filter((review) => review.revieweeId === userId);
}

export function getListingsByUserId(userId) {
  return listings.filter((listing) => listing.userId === userId);
}

export function getLeaderboardByUserId(userId) {
  return leaderboardStats.find((entry) => entry.userId === userId);
}

export function getSimilarListings(listing, limit = 3) {
  return listings
    .filter(
      (item) =>
        item.id !== listing.id &&
        (item.programSlug === listing.programSlug || item.courseSlug === listing.courseSlug)
    )
    .slice(0, limit);
}
