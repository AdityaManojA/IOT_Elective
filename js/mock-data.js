// =============================================================================
//  Smart Notice Board — Default Seed Data
//  Stored in / loaded from localStorage for offline-first Raspberry Pi kiosk
// =============================================================================
const DEFAULT_DATA = {
  config: {
    boardTitle: "Smart IoT Notice Board",
    institution: "Department of Mechatronics Engineering",
    collegeLogo: "",             // Base64 or image URL
    autoRotate: true,
    rotateInterval: 12,          // seconds per slide
    weatherEndpoint: "",          // leave blank to use built-in Open-Meteo
    weatherCity: "Kochi, Kerala",
    weatherLat: 9.9312,
    weatherLon: 76.2673,
    weatherRefreshInterval: 10,  // minutes
    kioskMode: true,
    theme: "auto",               // "auto" (sunset-based), "dark", or "light"
    newsRefreshInterval: 15     // minutes
  },

  admin: {
    username: "admin",
    password: "admin123"          // plain – changeable in Settings
  },

  notices: [
    {
      id: "not-1",
      title: "S7 & S5 Mechatronics Project Review & Viva Voce",
      category: "Academic",
      priority: "urgent",
      date: "2026-09-25",
      deadline: "2026-09-28",
      author: "HOD, Dept. of Mechatronics",
      content: "All S7 MRE (Capstone Project Phase 1) and S5 MRE (Design Project) students are informed that the first project presentation and viva voce will be held on Sept 28 in the Mechatronics Systems Lab. Submit project synopsis before 10:00 AM.",
      active: true
    },
    {
      id: "not-2",
      title: "NATIONAL ROBOTICS SYMPOSIUM 'MECHAVOLT 2026' Registrations Open",
      category: "Events",
      priority: "normal",
      date: "2026-09-22",
      deadline: "2026-10-05",
      author: "Robotics & Automation Club",
      content: "Annual National Level Robotics Symposium registrations are now live! Events include Robo-Wars, Autonomous Drone Racing, PLC Ladder Debugging, and CAD Marathon. Cash prizes worth ₹1,50,000!",
      active: true
    },
    {
      id: "not-3",
      title: "Raspberry Pi & Industrial Sensor Kits Distribution for S3 MRE",
      category: "Academic",
      priority: "high",
      date: "2026-09-25",
      deadline: "2026-09-26",
      author: "Lab In-Charge, Mechatronics",
      content: "Raspberry Pi 4 Model B, STM32 development boards, and sensor expansion kits will be distributed tomorrow at 02:00 PM in the Mechatronics Lab 1 for all S3 MRE students. Bring your student ID card.",
      active: true
    },
    {
      id: "not-4",
      title: "Campus Placement: ABB & Schneider Electric Automation Drive",
      category: "Placement",
      priority: "high",
      date: "2026-09-23",
      deadline: "2026-10-02",
      author: "Placement Cell",
      content: "Global industrial automation leaders hiring for Mechatronics Systems Engineer, PLC Programmer, and Robotics Engineer roles. Eligible batches: Final year S7 MRE. Register on portal by Friday.",
      active: true
    },
    {
      id: "not-5",
      title: "Library Extended Hours for End-Sem Examinations (Expired Notice)",
      category: "General",
      priority: "normal",
      date: "2026-09-10",
      deadline: "2026-09-24", // Past deadline: Sept 24 < Sept 25 -> automatically filtered out
      author: "Chief Librarian",
      content: "The Central Library will remain open until 10:00 PM on weekdays throughout the internal examination period with high-speed Wi-Fi and reference book access.",
      active: true
    },
    {
      id: "not-6",
      title: "Workshop on ROS2 (Robot Operating System) & Gazebo Simulation",
      category: "Events",
      priority: "high",
      date: "2026-09-25",
      deadline: "2026-10-08",
      author: "Mechatronics Association",
      content: "3-day hands-on bootcamp on ROS2 navigation stack, LiDAR mapping, and Gazebo simulation on Ubuntu & Raspberry Pi. Open to S7, S5, and S3 MRE students. Certificates for all participants.",
      active: true
    }
  ],

  achievements: [
    {
      id: "ach-1",
      studentName: "Felizya Shenil & Jincy K J",
      rollNo: "S5-MRE-09 / S5-MRE-14",
      title: "1st Prize – National Smart India Hackathon",
      competition: "SIH Hardware Edition 2026",
      award: "Gold Trophy & ₹1,00,000 Cash Prize",
      date: "2026-09-18",
      category: "IoT & Robotics",
      description: "Developed an autonomous Edge-AI and LoRaWAN based Agricultural Soil Quality & Irrigation Monitoring Drone system evaluated by Ministry of Agriculture.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: "ach-2",
      studentName: "Sniya Davis",
      rollNo: "S7-MRE-22",
      title: "Best Research Paper Award – IEEE ICCCNT",
      competition: "IEEE International Conference on Computing & Automation",
      award: "Best Student Researcher Award",
      date: "2026-09-10",
      category: "Research",
      description: "Authored and presented the peer-reviewed paper 'Optimizing Energy Harvesting Protocols for Ultra-Low Power Raspberry Pi Pico Mechatronic Sensor Nodes'.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: "ach-3",
      studentName: "Vasmiya MA",
      rollNo: "S5-MRE-31",
      title: "Winner – Cyber Security in Industrial Robotics CTF",
      competition: "Inter-University CyberShield Hackathon",
      award: "Top Defense Architect Shield",
      date: "2026-08-29",
      category: "Cybersecurity",
      description: "Secured Rank 1 among 140+ colleges by discovering zero-day firmware vulnerabilities in industrial PLC microcontrollers.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      featured: false
    },
    {
      id: "ach-4",
      studentName: "Team Robonauts (Arjun & Meera)",
      rollNo: "S3-MRE-04 / 18",
      title: "Championship – Autonomous Maze Rover",
      competition: "RoboOlympics South Zone",
      award: "Winner Trophy & Tech Grant",
      date: "2026-08-15",
      category: "Robotics",
      description: "Engineered a LiDAR and stereo-camera guided differential drive rover executing SLAM mapping algorithms on Raspberry Pi Zero 2W.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      featured: false
    }
  ],

  timetable: {
    classes: ["S7 MRE", "S5 MRE", "S3 MRE"],
    days: {
      "Monday": {
        "S7 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Robotics & Machine Vision",         code:"MR401", teacher:"Dr. Radhakrishnan V.", room:"LH-301" },
          { period:"2",      time:"10:00–11:00", subject:"MEMS & Microsystems",               code:"MR403", teacher:"Prof. Anita Nair",     room:"LH-301" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Industrial Automation & PLC",       code:"MR405", teacher:"Prof. Ananth R.",     room:"LH-301" },
          { period:"4",      time:"12:15–13:15", subject:"Mechatronics System Design",        code:"MR407", teacher:"Dr. Suresh T.",       room:"LH-301" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Advanced Robotics & Vision Lab",     code:"MR431", teacher:"Dr. Radhakrishnan",   room:"Robotics Lab" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Sensors & Signal Conditioning",     code:"MR301", teacher:"Prof. Priya M.",       room:"LH-204" },
          { period:"2",      time:"10:00–11:00", subject:"Microcontrollers & Embedded Systems",code:"MR303", teacher:"Dr. Geetha S.",       room:"LH-204" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Control Systems Engineering",        code:"MR305", teacher:"Prof. Rajesh V.",     room:"LH-204" },
          { period:"4",      time:"12:15–13:15", subject:"Power Electronics & Drives",         code:"MR307", teacher:"Dr. Maya N.",         room:"LH-204" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Microcontroller & PLC Lab",          code:"MR331", teacher:"Dr. Geetha & Rajesh", room:"Mechatronics Lab 1" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Mechanics of Solids & Kinematics",  code:"MR201", teacher:"Prof. Vinod K.",       room:"LH-102" },
          { period:"2",      time:"10:00–11:00", subject:"Electrical Machines & Drives",       code:"MR203", teacher:"Prof. Arun Kumar",     room:"LH-102" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Digital Electronics & Logic Design", code:"MR205", teacher:"Prof. Deepa S.",      room:"LH-102" },
          { period:"4",      time:"12:15–13:15", subject:"Materials Science & Metallurgy",    code:"MR207", teacher:"Dr. Paulson J.",       room:"LH-102" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Digital Electronics Lab",            code:"MR231", teacher:"Prof. Deepa & Team",   room:"Electronics Lab" }
        ]
      },
      "Tuesday": {
        "S7 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Industrial Automation & PLC",       code:"MR405", teacher:"Prof. Ananth R.",     room:"LH-301" },
          { period:"2",      time:"10:00–11:00", subject:"Mechatronics System Design",        code:"MR407", teacher:"Dr. Suresh T.",       room:"LH-301" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Robotics & Machine Vision",         code:"MR401", teacher:"Dr. Radhakrishnan V.", room:"LH-301" },
          { period:"4",      time:"12:15–13:15", subject:"Machine Learning in Robotics",      code:"MR409", teacher:"Prof. Vinod K.",       room:"LH-301" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Mechatronics Capstone Project",     code:"MR433", teacher:"Dept. Guides",         room:"Innovation Lab" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Power Electronics & Drives",         code:"MR307", teacher:"Dr. Maya N.",         room:"LH-204" },
          { period:"2",      time:"10:00–11:00", subject:"Sensors & Signal Conditioning",     code:"MR301", teacher:"Prof. Priya M.",       room:"LH-204" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"CAD/CAM & Digital Manufacturing",   code:"MR309", teacher:"Prof. Arun Kumar",     room:"LH-204" },
          { period:"4",      time:"12:15–13:15", subject:"Microcontrollers & Embedded Systems",code:"MR303", teacher:"Dr. Geetha S.",       room:"LH-204" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"CAD/CAM & Simulation Lab",          code:"MR333", teacher:"Prof. Arun & Instructors", room:"CAD Lab" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Digital Electronics & Logic Design", code:"MR205", teacher:"Prof. Deepa S.",      room:"LH-102" },
          { period:"2",      time:"10:00–11:00", subject:"Fluid Power Systems & Hydraulics",   code:"MR209", teacher:"Prof. Saji Thomas",    room:"LH-102" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Electrical Machines & Drives",       code:"MR203", teacher:"Prof. Arun Kumar",     room:"LH-102" },
          { period:"4",      time:"12:15–13:15", subject:"Mechanics of Solids & Kinematics",  code:"MR201", teacher:"Prof. Vinod K.",       room:"LH-102" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Fluid Power & Hydraulics Lab",      code:"MR233", teacher:"Prof. Saji Thomas",    room:"Hydraulics Lab" }
        ]
      },
      "Wednesday": {
        "S7 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"MEMS & Microsystems",               code:"MR403", teacher:"Prof. Anita Nair",     room:"LH-301" },
          { period:"2",      time:"10:00–11:00", subject:"Robotics & Machine Vision",         code:"MR401", teacher:"Dr. Radhakrishnan V.", room:"LH-301" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3 & 4",  time:"11:15–13:15", subject:"Industrial Automation & PLC Lab",   code:"MR435", teacher:"Prof. Ananth R.",     room:"Automation Lab" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5",      time:"14:00–15:00", subject:"Machine Learning in Robotics",      code:"MR409", teacher:"Prof. Vinod K.",       room:"LH-301" },
          { period:"6",      time:"15:00–16:00", subject:"Technical Colloquium / IPR",        code:"MR481", teacher:"Dr. Suresh T.",       room:"LH-301" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Control Systems Engineering",        code:"MR305", teacher:"Prof. Rajesh V.",     room:"LH-204" },
          { period:"2",      time:"10:00–11:00", subject:"Microcontrollers & Embedded Systems",code:"MR303", teacher:"Dr. Geetha S.",       room:"LH-204" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Sensors & Signal Conditioning",     code:"MR301", teacher:"Prof. Priya M.",       room:"LH-204" },
          { period:"4",      time:"12:15–13:15", subject:"Power Electronics & Drives",         code:"MR307", teacher:"Dr. Maya N.",         room:"LH-204" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Control Systems Simulation Lab",    code:"MR335", teacher:"Prof. Rajesh & Priya", room:"Sim Lab 2" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Electrical Machines & Drives",       code:"MR203", teacher:"Prof. Arun Kumar",     room:"LH-102" },
          { period:"2",      time:"10:00–11:00", subject:"Mechanics of Solids & Kinematics",  code:"MR201", teacher:"Prof. Vinod K.",       room:"LH-102" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Materials Science & Metallurgy",    code:"MR207", teacher:"Dr. Paulson J.",       room:"LH-102" },
          { period:"4",      time:"12:15–13:15", subject:"Fluid Power Systems & Hydraulics",   code:"MR209", teacher:"Prof. Saji Thomas",    room:"LH-102" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Electrical Machines Lab",           code:"MR235", teacher:"Prof. Arun & Staff",   room:"Machines Lab" }
        ]
      },
      "Thursday": {
        "S7 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Mechatronics System Design",        code:"MR407", teacher:"Dr. Suresh T.",       room:"LH-301" },
          { period:"2",      time:"10:00–11:00", subject:"Industrial Automation & PLC",       code:"MR405", teacher:"Prof. Ananth R.",     room:"LH-301" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"MEMS & Microsystems",               code:"MR403", teacher:"Prof. Anita Nair",     room:"LH-301" },
          { period:"4",      time:"12:15–13:15", subject:"Machine Learning in Robotics",      code:"MR409", teacher:"Prof. Vinod K.",       room:"LH-301" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Capstone Project Mentoring",        code:"MR433", teacher:"All Project Guides",   room:"Innovation Lab" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Microcontrollers & Embedded Systems",code:"MR303", teacher:"Dr. Geetha S.",       room:"LH-204" },
          { period:"2",      time:"10:00–11:00", subject:"CAD/CAM & Digital Manufacturing",   code:"MR309", teacher:"Prof. Arun Kumar",     room:"LH-204" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Control Systems Engineering",        code:"MR305", teacher:"Prof. Rajesh V.",     room:"LH-204" },
          { period:"4",      time:"12:15–13:15", subject:"Sensors & Signal Conditioning",     code:"MR301", teacher:"Prof. Priya M.",       room:"LH-204" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Sensors & Instrumentation Lab",     code:"MR337", teacher:"Prof. Priya & Team",   room:"Sensors Lab" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Fluid Power Systems & Hydraulics",   code:"MR209", teacher:"Prof. Saji Thomas",    room:"LH-102" },
          { period:"2",      time:"10:00–11:00", subject:"Materials Science & Metallurgy",    code:"MR207", teacher:"Dr. Paulson J.",       room:"LH-102" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Digital Electronics & Logic Design", code:"MR205", teacher:"Prof. Deepa S.",      room:"LH-102" },
          { period:"4",      time:"12:15–13:15", subject:"Electrical Machines & Drives",       code:"MR203", teacher:"Prof. Arun Kumar",     room:"LH-102" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5 & 6",  time:"14:00–16:00", subject:"Mechanics of Materials Testing Lab", code:"MR237", teacher:"Prof. Vinod & Paulson",room:"Materials Lab" }
        ]
      },
      "Friday": {
        "S7 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Robotics & Machine Vision",         code:"MR401", teacher:"Dr. Radhakrishnan V.", room:"LH-301" },
          { period:"2",      time:"10:00–11:00", subject:"MEMS & Microsystems",               code:"MR403", teacher:"Prof. Anita Nair",     room:"LH-301" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Mechatronics System Design",        code:"MR407", teacher:"Dr. Suresh T.",       room:"LH-301" },
          { period:"4",      time:"12:15–13:15", subject:"Industrial Automation & PLC",       code:"MR405", teacher:"Prof. Ananth R.",     room:"LH-301" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5",      time:"14:00–15:00", subject:"Technical Seminar",                 code:"MR483", teacher:"Staff Committee",     room:"Seminar Hall" },
          { period:"6",      time:"15:00–16:00", subject:"Robotics Club Activities",          code:"ACT01", teacher:"Faculty Advisor",     room:"Innovation Lab" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"CAD/CAM & Digital Manufacturing",   code:"MR309", teacher:"Prof. Arun Kumar",     room:"LH-204" },
          { period:"2",      time:"10:00–11:00", subject:"Power Electronics & Drives",         code:"MR307", teacher:"Dr. Maya N.",         room:"LH-204" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Control Systems Engineering",        code:"MR305", teacher:"Prof. Rajesh V.",     room:"LH-204" },
          { period:"4",      time:"12:15–13:15", subject:"Sensors & Signal Conditioning",     code:"MR301", teacher:"Prof. Priya M.",       room:"LH-204" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5",      time:"14:00–15:00", subject:"Mini Project Review",                code:"MR339", teacher:"Guide Committee",     room:"Project Lab" },
          { period:"6",      time:"15:00–16:00", subject:"Professional Ethics & Mentoring",    code:"HS301", teacher:"Dr. Geetha S.",       room:"LH-204" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:00–10:00", subject:"Mechanics of Solids & Kinematics",  code:"MR201", teacher:"Prof. Vinod K.",       room:"LH-102" },
          { period:"2",      time:"10:00–11:00", subject:"Digital Electronics & Logic Design", code:"MR205", teacher:"Prof. Deepa S.",      room:"LH-102" },
          { period:"Break",  time:"11:00–11:15", subject:"Short Break",                       code:"-",     teacher:"-",                   room:"Campus" },
          { period:"3",      time:"11:15–12:15", subject:"Fluid Power Systems & Hydraulics",   code:"MR209", teacher:"Prof. Saji Thomas",    room:"LH-102" },
          { period:"4",      time:"12:15–13:15", subject:"Materials Science & Metallurgy",    code:"MR207", teacher:"Dr. Paulson J.",       room:"LH-102" },
          { period:"Lunch",  time:"13:15–14:00", subject:"Lunch Break",                       code:"-",     teacher:"-",                   room:"Cafeteria" },
          { period:"5",      time:"14:00–15:00", subject:"Technical Communication",           code:"HS201", teacher:"Dept Faculty",         room:"LH-102" },
          { period:"6",      time:"15:00–16:00", subject:"Sports / Library / Robotics Club",   code:"ACT02", teacher:"Mentors",             room:"Auditorium" }
        ]
      },
      "Saturday": {
        "S7 MRE": [
          { period:"1",      time:"09:30–10:30", subject:"Industry Expert Guest Lecture",     code:"IND01", teacher:"Visiting Specialist",  room:"Seminar Hall" },
          { period:"2",      time:"10:30–12:30", subject:"Robotics Hackathon & Prototyping",   code:"LAB09", teacher:"Student Leads",        room:"Robotics Lab" }
        ],
        "S5 MRE": [
          { period:"1",      time:"09:30–10:30", subject:"Industrial PLC Workshop",           code:"IND02", teacher:"Siemens Certified Eng",room:"Automation Lab" },
          { period:"2",      time:"10:30–12:30", subject:"Embedded Hardware Debugging",        code:"LAB08", teacher:"Lab Staff",            room:"Mechatronics Lab 1" }
        ],
        "S3 MRE": [
          { period:"1",      time:"09:30–10:30", subject:"Hands-on Soldering & Circuit Design",code:"IND03", teacher:"Technical Instructors", room:"Electronics Lab" },
          { period:"2",      time:"10:30–12:30", subject:"SolidWorks 3D Modeling Workshop",   code:"LAB07", teacher:"CAD Leads",            room:"CAD Lab" }
        ]
      }
    }
  },

  weatherFallback: {
    location: "Campus Weather Station",
    temperature: 28.4,
    feelsLike: 31.2,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    humidity: 78,
    windSpeed: 12.4,
    pressure: 1012,
    uvIndex: 6.2,
    airQuality: "Good (AQI 42)",
    rainProbability: 25,
    forecast: [
      { time:"12:00", temp:29.5, icon:"sunny",         pop:"10%" },
      { time:"14:00", temp:31.0, icon:"partly-cloudy", pop:"20%" },
      { time:"16:00", temp:28.8, icon:"rain",          pop:"65%" },
      { time:"18:00", temp:27.2, icon:"thunder",       pop:"40%" },
      { time:"20:00", temp:26.0, icon:"cloudy",        pop:"15%" }
    ],
    daily: [
      { day:"Today",     condition:"Scattered Clouds", high:31, low:24, icon:"partly-cloudy" },
      { day:"Tomorrow",  condition:"Thunder Showers",  high:29, low:23, icon:"thunder"       },
      { day:"Saturday",  condition:"Mostly Sunny",     high:32, low:25, icon:"sunny"         },
      { day:"Sunday",    condition:"Clear Sky",        high:33, low:24, icon:"sunny"         }
    ]
  }
};

window.DEFAULT_NOTICE_DATA = DEFAULT_DATA;
