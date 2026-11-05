import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, ThumbsUp, Calendar, Clock, MapPin, Users, CheckCircle2, 
  Pin, Trash2, Plus, Tv, ExternalLink, Lock, Sparkles, 
  Check, X, ArrowRight, ShieldCheck, Send, Mic, 
  CheckSquare, Square, Flame, Image as ImageIcon
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';

// --- KONFIGURASI FIREBASE UNTUK DEPLOYMENT NETLIFY (OPSIONAL) ---
// Tempelkan firebaseConfig dari Firebase Console Anda di sini saat deploy ke Netlify
// agar Live Q&A tersinkronisasi secara real-time antar HP peserta & layar panggung.
// const CUSTOM_FIREBASE_CONFIG = null; 
const CUSTOM_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};


// --- Firebase Initialization with Resilient Local Fallback ---
let db = null;
let auth = null;
let isFirebaseActive = false;
let appId = 'devfest-jogja-2026';

try {
  const rawConfig = CUSTOM_FIREBASE_CONFIG || (typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : null);
  if (rawConfig && rawConfig.apiKey) {
    const app = initializeApp(rawConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof __app_id !== 'undefined' && __app_id) {
      appId = __app_id;
    }
    isFirebaseActive = true;
  }
} catch (e) {
  console.warn("Firebase config fallback to local state:", e);
}

// --- Official Constants & Links ---
const OFFICIAL_BANNER_URL = "https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/event_banners/blob_wotIgEF";
const GDG_LOGO_SVGREPO_URL = "https://www.svgrepo.com/show/353810/google-developers.svg";
const BEVY_RSVP_URL = "https://gdg.community.dev/events/details/google-gdg-jogjakarta-presents-devfest-jogjakarta-2026/";
const VIBE_CHALLENGE_URL = "https://vibe.gdgjogjakarta.id";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/Zb6n3EVpi7VA8wWf6";

// --- Official Google Developers Logo Component (from svgrepo.com/svg/353810/google-developers with inline SVG fallback) ---
function GdgLogo({ className = "w-8 h-8" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src={GDG_LOGO_SVGREPO_URL}
        alt="Google Developers Logo"
        className={`${className} object-contain select-none`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 256 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Developers Logo"
    >
      <path fill="#EA4335" d="M89.2 44.6L26.5 80.8c-11.6 6.7-15.6 21.5-8.9 33.1 6.7 11.6 21.5 15.6 33.1 8.9l62.7-36.2c11.6-6.7 15.6-21.5 8.9-33.1-6.7-11.6-21.5-15.6-33.1-8.9z" />
      <path fill="#4285F4" d="M113.4 139.2L50.7 103c-11.6-6.7-26.4-2.7-33.1 8.9-6.7 11.6-2.7 26.4 8.9 33.1l62.7 36.2c11.6 6.7 26.4 2.7 33.1-8.9 6.7-11.6 2.7-26.4-8.9-33.1z" />
      <path fill="#FBBC04" d="M205.3 181.2l62.7-36.2c11.6-6.7 15.6-21.5 8.9-33.1-6.7-11.6-21.5-15.6-33.1-8.9l-62.7 36.2c-11.6 6.7-15.6 21.5-8.9 33.1 6.7 11.6 21.5 15.6 33.1 8.9z" transform="translate(-32 0)" />
      <path fill="#34A853" d="M238.4 80.8L175.7 44.6c-11.6-6.7-26.4-2.7-33.1 8.9-6.7 11.6-2.7 26.4 8.9 33.1l62.7 36.2c11.6 6.7 26.4 2.7 33.1-8.9 6.7-11.6 2.7-26.4-8.9-33.1z" transform="translate(-32 0)" />
    </svg>
  );
}

// --- Exact 16 Speakers with Official Bevy / Startup Grind Cloudinary Photos ---
const INITIAL_SPEAKERS = [
  {
    id: "spk-1",
    name: "Muhammad Saipul Rohman",
    org: "Accenture",
    role: "Data Engineer • GDE Cloud",
    stage: "Stage #1: Merapi Stage",
    topic: "From Warehouse to Agent Skill Hub: Connecting AI Agents to BigQuery with Google Cloud Managed MCP",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/blob_DjShyTn"
  },
  {
    id: "spk-2",
    name: "Eka Jayani Ayuningtyas",
    org: "AtmaConnect",
    role: "GDE Web • Web Developer",
    stage: "Stage #2: Prambanan Stage & Ask The Expert #2",
    topic: "Native-like Modern Web UI for You and Your Agent",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Eka%2520Jayani%25201_459qbct.png"
  },
  {
    id: "spk-3",
    name: "Joan Santoso",
    org: "ISTTS",
    role: "GDE AI & Cloud • Director of Research and Innovation",
    stage: "Stage #1: Merapi Stage & Ask The Expert #2",
    topic: "From GPU Basics to Agentic AI: Serving Open Models with vLLM",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/blob_Kw0Fgam"
  },
  {
    id: "spk-4",
    name: "Qassandra Chaidir",
    org: "Google Developer Expert",
    role: "Google Developer Expert Cloud",
    stage: "Stage #1: Merapi Stage & Ask The Expert #1",
    topic: "Behind the Bill: What We’re Actually Paying for AI & Infrastructure Cost",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/1634490878792.jpeg"
  },
  {
    id: "spk-5",
    name: "Alvin Prayuda Juniarta Dwiyantoro",
    org: "Google Cloud",
    role: "Senior Developer Relations Engineer",
    stage: "Stage #1: Merapi Stage & Ask The Expert #1",
    topic: "Agent Harness with the Developer Plugin and Opinionated Skills: Migrating a Vibe-Coded App",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/blob_g568hYn"
  },
  {
    id: "spk-6",
    name: "Zain Fathoni",
    org: "Relay Commerce",
    role: "Senior Front-End Engineer",
    stage: "Stage #2: Prambanan Stage",
    topic: "Delivering Software Without Looking at the Code",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/1688804083526_4PJbBHZ.jpeg"
  },
  {
    id: "spk-7",
    name: "Esther Irawati Setiawan",
    org: "ISTTS",
    role: "GDE AI & Cloud • Head of Dept. Information Systems",
    stage: "Stage #2: Prambanan Stage",
    topic: "Offline Mobile-Ready AI Architecture: Deploying Open Models with LiteRT-LLM",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/WhatsApp%2520Image%25202026-01-05%2520at%252020.49.46%2520-%2520Esther%2520Irawati%2520Setiawan_SZpx9YH.jpeg"
  },
  {
    id: "spk-8",
    name: "Stevani Dwi Utomo",
    org: "Accenture",
    role: "Data & AI Analyst",
    stage: "Workshop #1: Kawruh Lab",
    topic: "Pocket Visionary: Shipping a Native Compose AI Camera App to Your Phone",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Stevani%2520Dwi%2520Utomo_ZOGXaHQ.jpg"
  },
  {
    id: "spk-9",
    name: "Estu Fardani",
    org: "DevOps Consultant",
    role: "DevOps & Cloud Consultant",
    stage: "Workshop #2: Karya Lab",
    topic: "Barista Bot Ops: From Agentic AI to Production — Ship Your AI Agent on Cloud Run",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Estu_PL3alX8.png"
  },
  {
    id: "spk-10",
    name: "Samuel Simon",
    org: "INA Digital Edu",
    role: "Chief Technology Officer (CTO)",
    stage: "Stage #1: Merapi Stage",
    topic: "How We’re Improving Platform Engineering Workflows with AI",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/Profil-Samuel-Simon_WBL9LMO.jpeg"
  },
  {
    id: "spk-11",
    name: "Fariz Agati",
    org: "Hubble.build / ISQA Jogja",
    role: "Software QA Lead",
    stage: "Stage #2: Prambanan Stage",
    topic: "The Cost of Cheap Code: You Vibe-Coded It, Now Who Tests It?",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/FarizAgati-Casual-Red%2520T-shirt_0E52b9J.jpeg"
  },
  {
    id: "spk-12",
    name: "Amiratur Rafifah",
    org: "PyLadies Yogyakarta",
    role: "Community Organizer",
    stage: "Stage #1: Merapi Stage",
    topic: "Plot Twist Proof: Merencana Pakai AI, Berdamai dengan Takdir",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/IMG_8424-cropped_rbhC3Qt.jpeg"
  },
  {
    id: "spk-13",
    name: "Listiarso Wastuargo",
    org: "Metatech.id",
    role: "CROTO",
    stage: "Stage #2: Prambanan Stage & Ask The Expert #1",
    topic: "Voice Agent with Gemini that doesn’t yap, but actually works",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/IMG_1491%2520Copy_yGKtAbh.JPG"
  },
  {
    id: "spk-14",
    name: "Lutfi Zuchri",
    org: "Python Software Foundation / Py.Jogja",
    role: "Docs Workgroup",
    stage: "Stage #2: Prambanan Stage & Ask The Expert #2",
    topic: "Artificial Intelligence Beyond GPU",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/IMG_20261026_145144_828_umQBXwU.jpg"
  },
  {
    id: "spk-15",
    name: "Jefri Herdi Triyanto",
    org: "PT. Sawang Teknologi Indonesia",
    role: "Chief Executive Officer (CEO)",
    stage: "Workshop #1: Kawruh Lab",
    topic: "Pocket Agent: Build Your 24/7 Autonomous AI Assistant on Android with Gemini & Hermes",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/WhatsApp%2520Image%25202026-10-27%2520at%25209.00.09%2520PM%2520%25281%2529_mv5Este.jpeg"
  },
  {
    id: "spk-16",
    name: "Arif Akbarul Huda",
    org: "Universitas Amikom Yogyakarta",
    role: "Senior Researcher AI/ML",
    stage: "Workshop #2: Karya Lab",
    topic: "Ubah Kode Jadi Musik! Algoritma, Arsitektur, dan Hands-On Model Musik Generatif",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_face,h_400,q_auto:good,w_400/v1/gcs/platform-data-goog/events/arif-akbarul-huda_NKHuiY3.JPEG"
  }
];

// --- Official 6 GDG Jogjakarta Organizers (With Exact Bevy Photos & Title Case Names) ---
const INITIAL_ORGANIZERS = [
  {
    id: "org-1",
    name: "Chaisar A",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/chaisar_ahmad.jpg"
  },
  {
    id: "org-2",
    name: "Wijatama Diwangkara",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/wijatama_diwangkara.jpg"
  },
  {
    id: "org-3",
    name: "Putu Raditha Chintia Wardhani",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/putu_raditha.jpeg"
  },
  {
    id: "org-4",
    name: "Yolanda Al Hidayah Pasaribu",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/yolanda_al_hidayah_pasaribu_d2JDrDg.jpg"
  },
  {
    id: "org-5",
    name: "Deviana Dyaaah",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/deviana_dyaaah.jpg"
  },
  {
    id: "org-6",
    name: "Nahdhiyah",
    role: "Organizer",
    photo: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/featured_attendees/IMG_20200201_105102_658.jpg"
  }
];

// --- Official 6 Panelist & Ask The Expert Q&A Sessions (Matched to Official HTML Schedule) ---
const DEFAULT_QNA_SESSIONS = [
  {
    id: "merapi-qna-1",
    title: "Stage #1: Merapi Stage — Morning Q&A",
    subtitle: "BigQuery Managed MCP, AI Planning & Serving Open Models with vLLM",
    time: "11:20–11:35 WIB",
    room: "Stage #1 • Merapi Stage (Main Stage)",
    category: "Main Stage Q&A",
    accent: "blue",
    panelists: [
      { name: "Muhammad Saipul Rohman", role: "Data Engineer @ Accenture • GDE Cloud" },
      { name: "Amiratur Rafifah", role: "Organizer @ PyLadies Yogyakarta" },
      { name: "Joan Santoso", role: "GDE AI & Cloud • Director of Research @ ISTTS" }
    ]
  },
  {
    id: "prambanan-qna-1",
    title: "Stage #2: Prambanan Stage — Morning Q&A",
    subtitle: "AI Beyond GPU, Delivering Software Without Looking at Code & Modern Web UI for Agents",
    time: "11:20–11:35 WIB",
    room: "Stage #2 • Prambanan Stage (Main Stage)",
    category: "Main Stage Q&A",
    accent: "blue",
    panelists: [
      { name: "Lutfi Zuchri", role: "Docs Workgroup @ Python Software Foundation / Py.Jogja" },
      { name: "Zain Fathoni", role: "Senior Front-End Engineer @ Relay Commerce" },
      { name: "Eka Jayani Ayuningtyas", role: "GDE Web • Web Developer @ AtmaConnect" }
    ]
  },
  {
    id: "ask-expert-1",
    title: "Ask The Expert #1 — Topic: Tech Career",
    subtitle: "Interactive Career & Engineering Growth Q&A in Vibe Lounge",
    time: "10:50–11:20 WIB",
    room: "Vibe Lounge",
    category: "Ask The Expert",
    accent: "purple",
    panelists: [
      { name: "Listiarso Wastuargo", role: "CROTO @ Metatech.id" },
      { name: "Alvin Prayuda", role: "Senior DevRel Engineer @ Google Cloud" },
      { name: "Qassandra Chaidir", role: "Google Developer Expert Cloud" }
    ]
  },
  {
    id: "merapi-qna-2",
    title: "Stage #1: Merapi Stage — Afternoon Q&A",
    subtitle: "AI & Infrastructure Cost, Platform Engineering Workflows & Agent Harness Migration",
    time: "14:05–14:20 WIB",
    room: "Stage #1 • Merapi Stage (Main Stage)",
    category: "Main Stage Q&A",
    accent: "blue",
    panelists: [
      { name: "Qassandra Chaidir", role: "Google Developer Expert Cloud" },
      { name: "Samuel Simon", role: "Chief Technology Officer @ INA Digital Edu" },
      { name: "Alvin Prayuda", role: "Senior DevRel Engineer @ Google Cloud" }
    ]
  },
  {
    id: "prambanan-qna-2",
    title: "Stage #2: Prambanan Stage — Afternoon Q&A",
    subtitle: "Testing Vibe-Coded Apps, Offline Mobile AI with LiteRT-LLM & Voice Agents with Gemini",
    time: "14:05–14:20 WIB",
    room: "Stage #2 • Prambanan Stage (Main Stage)",
    category: "Main Stage Q&A",
    accent: "blue",
    panelists: [
      { name: "Fariz Agati", role: "Software QA Lead @ Hubble.build / ISQA Jogja" },
      { name: "Esther Irawati", role: "GDE AI & Cloud • Head of Dept. IS @ ISTTS" },
      { name: "Listiarso Wastuargo", role: "CROTO @ Metatech.id" }
    ]
  },
  {
    id: "ask-expert-2",
    title: "Ask The Expert #2 — Topic: Tech Community",
    subtitle: "Building Together, Open Source & Scaling Tech Communities in Vibe Lounge",
    time: "13:35–14:05 WIB",
    room: "Vibe Lounge",
    category: "Ask The Expert",
    accent: "purple",
    panelists: [
      { name: "Eka Jayani Ayuningtyas", role: "GDE Web • Web Developer @ AtmaConnect" },
      { name: "Joan Santoso", role: "GDE AI & Cloud • Director of Research @ ISTTS" },
      { name: "Lutfi Zuchri", role: "Python Software Foundation / Py.Jogja" }
    ]
  }
];

// --- Complete Chronological Schedule Items (100% Matched to DevFest_Speaker_Schedule aka Rundown.html) ---
const RUNDOWN_ITEMS = [
  // 08:00 - 09:00
  {
    id: "all-reg",
    order: 1,
    room: "All Spaces",
    roomBadge: "All Rooms (Merapi, Prambanan, Kawruh, Karya & Vibe Lounge)",
    time: "08:00–09:00 WIB",
    title: "Registration",
    speaker: "All Rooms • Gate Cut-off for E-Ticket Holders at 08:45 WIB",
    speakerNames: [],
    type: "Registration",
    styleType: "muted"
  },
  // 09:00 - 09:40
  {
    id: "all-keynote",
    order: 2,
    room: "All Spaces",
    roomBadge: "All Spaces • Main Stage",
    time: "09:00–09:40 WIB",
    title: "Opening Keynote & Photo",
    speaker: "GDG Jogjakarta Opening Keynote & Group Photo Session",
    speakerNames: [],
    type: "Keynote",
    styleType: "break"
  },
  // 09:40 - 09:50
  {
    id: "all-move-1",
    order: 3,
    room: "All Spaces",
    roomBadge: "All Spaces",
    time: "09:40–09:50 WIB",
    title: "Moving",
    speaker: "Transition to Stage #1 Merapi Stage, Stage #2 Prambanan Stage, Kawruh Lab, Karya Lab & Vibe Lounge",
    speakerNames: [],
    type: "Transition",
    styleType: "break"
  },

  // 09:50 - 10:20 / 10:50 / 11:20 PARALLEL MORNING SESSIONS
  {
    id: "m-1",
    order: 4,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "09:50–10:20 WIB",
    title: "From Warehouse to Agent Skill Hub: Connecting AI Agents to BigQuery with Google Cloud Managed MCP",
    speaker: "Muhammad Saipul Rohman",
    speakerNames: ["Muhammad Saipul Rohman"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-1"
  },
  {
    id: "p-1",
    order: 5,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "09:50–10:20 WIB",
    title: "Artificial Intelligence Beyond GPU",
    speaker: "Lutfi Zuchri",
    speakerNames: ["Lutfi Zuchri"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-1"
  },
  {
    id: "kw-1",
    order: 6,
    room: "Workshop #1: Kawruh Lab",
    roomBadge: "Workshop #1 • Kawruh Lab",
    time: "09:50–11:20 WIB",
    title: "Pocket Agent: Build Your 24/7 Autonomous AI Assistant on Android with Gemini & Hermes",
    speaker: "Jefri Herdi Triyanto",
    speakerNames: ["Jefri Herdi Triyanto"],
    type: "Workshop #1",
    styleType: "workshop"
  },
  {
    id: "kr-1",
    order: 7,
    room: "Workshop #2: Karya Lab",
    roomBadge: "Workshop #2 • Karya Lab",
    time: "09:50–11:20 WIB",
    title: "Barista Bot Ops: From Agentic AI to Production — Ship Your AI Agent on Cloud Run",
    speaker: "Estu Fardani",
    speakerNames: ["Estu Fardani"],
    type: "Workshop #2",
    styleType: "workshop"
  },
  {
    id: "vl-1",
    order: 8,
    room: "Vibe Lounge",
    roomBadge: "Vibe Lounge",
    time: "09:50–10:50 WIB",
    title: "Vibe-to-Prototype: Build Your Custom App in 30 Minutes with Google AI Studio",
    speaker: "Vibe Challenge Sprint • vibe.gdgjogjakarta.id",
    speakerNames: [],
    type: "Vibe Challenge",
    styleType: "vibe",
    isVibeChallenge: true
  },

  // 10:20 - 10:50
  {
    id: "m-2",
    order: 9,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "10:20–10:50 WIB",
    title: "Plot Twist Proof: Merencana Pakai AI, Berdamai dengan Takdir",
    speaker: "Amiratur Rafifah",
    speakerNames: ["Amiratur Rafifah"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-1"
  },
  {
    id: "p-2",
    order: 10,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "10:20–10:50 WIB",
    title: "Delivering Software Without Looking at the Code",
    speaker: "Zain Fathoni",
    speakerNames: ["Zain Fathoni"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-1"
  },

  // 10:50 - 11:20
  {
    id: "m-3",
    order: 11,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "10:50–11:20 WIB",
    title: "From GPU Basics to Agentic AI: Serving Open Models with vLLM",
    speaker: "Joan Santoso",
    speakerNames: ["Joan Santoso"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-1"
  },
  {
    id: "p-3",
    order: 12,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "10:50–11:20 WIB",
    title: "Native-like Modern Web UI for You and Your Agent",
    speaker: "Eka Jayani Ayuningtyas",
    speakerNames: ["Eka Jayani Ayuningtyas"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-1"
  },
  {
    id: "vl-2",
    order: 13,
    room: "Vibe Lounge",
    roomBadge: "Vibe Lounge",
    time: "10:50–11:20 WIB",
    title: "Ask The Expert #1 — Topic: Tech Career",
    speaker: "Listiarso Wastuargo, Alvin Prayuda, Qassandra Chaidir",
    speakerNames: ["Listiarso Wastuargo", "Alvin Prayuda Juniarta Dwiyantoro", "Qassandra Chaidir"],
    type: "Ask The Expert",
    styleType: "vibe",
    qnaSessionId: "ask-expert-1",
    isQnaSlot: true
  },

  // 11:20 - 11:35 MORNING Q&A
  {
    id: "m-4",
    order: 14,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "11:20–11:35 WIB",
    title: "Q&A — Stage #1: Merapi Stage (Morning Session)",
    speaker: "Panelists: Muhammad Saipul Rohman, Amiratur Rafifah, Joan Santoso",
    speakerNames: ["Muhammad Saipul Rohman", "Amiratur Rafifah", "Joan Santoso"],
    type: "Main Stage Q&A",
    styleType: "qna",
    qnaSessionId: "merapi-qna-1",
    isQnaSlot: true
  },
  {
    id: "p-4",
    order: 15,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "11:20–11:35 WIB",
    title: "Q&A — Stage #2: Prambanan Stage (Morning Session)",
    speaker: "Panelists: Lutfi Zuchri, Zain Fathoni, Eka Jayani Ayuningtyas",
    speakerNames: ["Lutfi Zuchri", "Zain Fathoni", "Eka Jayani Ayuningtyas"],
    type: "Main Stage Q&A",
    styleType: "qna",
    qnaSessionId: "prambanan-qna-1",
    isQnaSlot: true
  },

  // 11:35 - 12:35 LUNCH BREAK
  {
    id: "all-lunch",
    order: 16,
    room: "All Spaces",
    roomBadge: "All Spaces",
    time: "11:35–12:35 WIB",
    title: "Lunch Break",
    speaker: "Break & Networking Across All Rooms",
    speakerNames: [],
    type: "Break",
    styleType: "break"
  },

  // 12:35 - 13:05 / 13:35 / 14:05 PARALLEL AFTERNOON SESSIONS
  {
    id: "m-5",
    order: 17,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "12:35–13:05 WIB",
    title: "Behind the Bill: What We’re Actually Paying for AI & Infrastructure Cost",
    speaker: "Qassandra Chaidir",
    speakerNames: ["Qassandra Chaidir"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-2"
  },
  {
    id: "p-5",
    order: 18,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "12:35–13:05 WIB",
    title: "The Cost of Cheap Code: You Vibe-Coded It, Now Who Tests It?",
    speaker: "Fariz Agati",
    speakerNames: ["Fariz Agati"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-2"
  },
  {
    id: "kw-2",
    order: 19,
    room: "Workshop #1: Kawruh Lab",
    roomBadge: "Workshop #1 • Kawruh Lab",
    time: "12:35–14:05 WIB",
    title: "Pocket Visionary: Shipping a Native Compose AI Camera App to Your Phone",
    speaker: "Stevani Dwi Utomo",
    speakerNames: ["Stevani Dwi Utomo"],
    type: "Workshop #1",
    styleType: "workshop"
  },
  {
    id: "kr-2",
    order: 20,
    room: "Workshop #2: Karya Lab",
    roomBadge: "Workshop #2 • Karya Lab",
    time: "12:35–14:05 WIB",
    title: "Ubah Kode Jadi Musik! Algoritma, Arsitektur, dan Hands-On Model Musik Generatif",
    speaker: "Arif Akbarul Huda",
    speakerNames: ["Arif Akbarul Huda"],
    type: "Workshop #2",
    styleType: "workshop"
  },
  {
    id: "vl-3",
    order: 21,
    room: "Vibe Lounge",
    roomBadge: "Vibe Lounge",
    time: "12:35–13:35 WIB",
    title: "Speedrun Micro-Deploy: Ship a Live AI Function to Cloud Run in 30 Minutes",
    speaker: "Vibe Challenge Sprint • vibe.gdgjogjakarta.id",
    speakerNames: [],
    type: "Vibe Challenge",
    styleType: "vibe",
    isVibeChallenge: true
  },

  // 13:05 - 13:35
  {
    id: "m-6",
    order: 22,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "13:05–13:35 WIB",
    title: "How We’re Improving Platform Engineering Workflows with AI",
    speaker: "Samuel Simon",
    speakerNames: ["Samuel Simon"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-2"
  },
  {
    id: "p-6",
    order: 23,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "13:05–13:35 WIB",
    title: "Offline Mobile-Ready AI Architecture: Deploying Open Models with LiteRT-LLM",
    speaker: "Esther Irawati",
    speakerNames: ["Esther Irawati Setiawan"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-2"
  },

  // 13:35 - 14:05
  {
    id: "m-7",
    order: 24,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "13:35–14:05 WIB",
    title: "Agent Harness with the Developer Plugin and Opinionated Skills: Migrating a Vibe-Coded App",
    speaker: "Alvin Prayuda",
    speakerNames: ["Alvin Prayuda Juniarta Dwiyantoro"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "merapi-qna-2"
  },
  {
    id: "p-7",
    order: 25,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "13:35–14:05 WIB",
    title: "Voice Agent with Gemini that doesn’t yap, but actually works",
    speaker: "Listiarso Wastuargo",
    speakerNames: ["Listiarso Wastuargo"],
    type: "Main Stage Talk",
    styleType: "talk",
    qnaSessionId: "prambanan-qna-2"
  },
  {
    id: "vl-4",
    order: 26,
    room: "Vibe Lounge",
    roomBadge: "Vibe Lounge",
    time: "13:35–14:05 WIB",
    title: "Ask The Expert #2 — Topic: Tech Community",
    speaker: "Eka Jayani Ayuningtyas, Joan Santoso, Lutfi Zuchri",
    speakerNames: ["Eka Jayani Ayuningtyas", "Joan Santoso", "Lutfi Zuchri"],
    type: "Ask The Expert",
    styleType: "vibe",
    qnaSessionId: "ask-expert-2",
    isQnaSlot: true
  },

  // 14:05 - 14:20 AFTERNOON Q&A
  {
    id: "m-8",
    order: 27,
    room: "Stage #1: Merapi Stage",
    roomBadge: "Stage #1 • Merapi Stage (Main Stage)",
    time: "14:05–14:20 WIB",
    title: "Q&A — Stage #1: Merapi Stage (Afternoon Session)",
    speaker: "Panelists: Qassandra Chaidir, Samuel Simon, Alvin Prayuda",
    speakerNames: ["Qassandra Chaidir", "Samuel Simon", "Alvin Prayuda Juniarta Dwiyantoro"],
    type: "Main Stage Q&A",
    styleType: "qna",
    qnaSessionId: "merapi-qna-2",
    isQnaSlot: true
  },
  {
    id: "p-8",
    order: 28,
    room: "Stage #2: Prambanan Stage",
    roomBadge: "Stage #2 • Prambanan Stage (Main Stage)",
    time: "14:05–14:20 WIB",
    title: "Q&A — Stage #2: Prambanan Stage (Afternoon Session)",
    speaker: "Panelists: Fariz Agati, Esther Irawati, Listiarso Wastuargo",
    speakerNames: ["Fariz Agati", "Esther Irawati Setiawan", "Listiarso Wastuargo"],
    type: "Main Stage Q&A",
    styleType: "qna",
    qnaSessionId: "prambanan-qna-2",
    isQnaSlot: true
  },

  // 14:20 - 14:30 MOVING
  {
    id: "all-move-2",
    order: 29,
    room: "All Spaces",
    roomBadge: "All Spaces",
    time: "14:20–14:30 WIB",
    title: "Moving",
    speaker: "Moving to Main Stage for Winner Announcement & Closing",
    speakerNames: [],
    type: "Transition",
    styleType: "break"
  },

  // 14:30 - 15:00 CLOSING
  {
    id: "all-closing",
    order: 30,
    room: "All Spaces",
    roomBadge: "All Spaces • Main Stage",
    time: "14:30–15:00 WIB",
    title: "Build Challenge Winner Announcement & Closing",
    speaker: "GDG Jogjakarta Organizers & Vibe Challenge Judges",
    speakerNames: [],
    type: "Closing",
    styleType: "break",
    isVibeChallenge: true
  }
];

// --- Initial Seeded Questions for Live Q&A ---
const DEFAULT_QUESTIONS = [
  {
    id: "q-101",
    sessionId: "merapi-qna-1",
    sessionTitle: "Stage #1: Merapi Stage — Morning Q&A",
    targetPanelist: "Muhammad Saipul Rohman",
    authorName: "Raka Pratama (UGM)",
    isAnonymous: false,
    text: "When connecting AI Agents to BigQuery using Managed MCP, how do we enforce row-level security and prevent prompt-injected SQL queries from leaking sensitive datasets?",
    votes: 42,
    isAnswered: false,
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2.2
  },
  {
    id: "q-102",
    sessionId: "merapi-qna-1",
    sessionTitle: "Stage #1: Merapi Stage — Morning Q&A",
    targetPanelist: "Joan Santoso",
    authorName: "Dimas (Cloud Engineer)",
    isAnonymous: false,
    text: "For serving open-weight models with vLLM, when does it make sense to move from managed endpoints to dedicated GPU clusters?",
    votes: 31,
    isAnswered: false,
    isPinned: false,
    createdAt: Date.now() - 3600000 * 1.8
  },
  {
    id: "q-103",
    sessionId: "ask-expert-1",
    sessionTitle: "Ask The Expert #1 — Topic: Tech Career",
    targetPanelist: "All Panelists",
    authorName: "Anonymous",
    isAnonymous: true,
    text: "With AI coding assistants automating boilerplate code, what specific skills do hiring managers and CTOs look for in junior and mid-level engineers in 2026?",
    votes: 54,
    isAnswered: false,
    isPinned: true,
    createdAt: Date.now() - 3600000 * 1.5
  },
  {
    id: "q-104",
    sessionId: "merapi-qna-2",
    sessionTitle: "Stage #1: Merapi Stage — Afternoon Q&A",
    targetPanelist: "Alvin Prayuda",
    authorName: "Budi Santoso",
    isAnonymous: false,
    text: "What are the biggest architectural pitfalls you encounter when migrating a 'vibe-coded' prototype into a production-grade cloud service with proper observability?",
    votes: 37,
    isAnswered: false,
    isPinned: false,
    createdAt: Date.now() - 3600000 * 1.2
  },
  {
    id: "q-105",
    sessionId: "prambanan-qna-2",
    sessionTitle: "Stage #2: Prambanan Stage — Afternoon Q&A",
    targetPanelist: "Fariz Agati",
    authorName: "Siti Rahma (QA Engineer)",
    isAnonymous: false,
    text: "How can QA teams keep up when developers generate 5x more PRs using AI coding tools without becoming the bottleneck in CI/CD?",
    votes: 28,
    isAnswered: false,
    isPinned: false,
    createdAt: Date.now() - 3600000 * 0.9
  },
  {
    id: "q-106",
    sessionId: "ask-expert-2",
    sessionTitle: "Ask The Expert #2 — Topic: Tech Community",
    targetPanelist: "All Panelists",
    authorName: "Nadia (PyLadies Member)",
    isAnonymous: false,
    text: "How did contributing to local communities like Py.Jogja or GDG Jogjakarta help open doors to global programs like GDE or PSF?",
    votes: 23,
    isAnswered: true,
    isPinned: false,
    createdAt: Date.now() - 3600000 * 0.5
  }
];

export default function App() {
  // Primary Route State:
  // 'public-landing' -> Home (Landing Page & Rundown)
  // 'public-qna'     -> Live Q&A (Attendee Slido View)
  // 'organizer'      -> Dedicated Organizer Moderation Page
  // 'stage'          -> Auditorium Stage Projector View
  const [currentRoute, setCurrentRoute] = useState('public-landing');

  // Schedule Filter State (Previous Track Filter Card Format)
  const [selectedTrackRoom, setSelectedTrackRoom] = useState('ALL');

  // Speakers & Organizers State (Initialized with Exact Bevy Cloudinary URLs)
  const [speakers, setSpeakers] = useState(INITIAL_SPEAKERS);
  const [organizers] = useState(INITIAL_ORGANIZERS);
  const [showPhotoManagerModal, setShowPhotoManagerModal] = useState(false);

  // Q&A Session & Filtering State
  const [qnaSessions, setQnaSessions] = useState(DEFAULT_QNA_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState('merapi-qna-1');
  const [qnaSort, setQnaSort] = useState('popular'); // 'popular' | 'latest' | 'answered'
  const [organizerFilterStatus, setOrganizerFilterStatus] = useState('all'); // 'all' | 'active' | 'answered'

  // Attendee Ask Form State
  const [questionText, setQuestionText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [targetPanelist, setTargetPanelist] = useState('All Panelists');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Organizer Authentication & Moderation State
  const [isOrganizerUnlocked, setIsOrganizerUnlocked] = useState(false);
  const [organizerPin, setOrganizerPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedQuestionIdsForBulk, setSelectedQuestionIdsForBulk] = useState(new Set());
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    subtitle: '',
    time: '14:05–14:20 WIB',
    room: 'Stage #1 • Merapi Stage (Main Stage)',
    category: 'Main Stage Q&A',
    accent: 'blue',
    panelistsCsv: 'Speaker One, Speaker Two'
  });

  // Questions & Upvotes Store
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [votedIds, setVotedIds] = useState(new Set());
  const [stageQuestionId, setStageQuestionId] = useState('q-101');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Support URL hash navigation (#organizer, #qna, #stage) for direct team access
  useEffect(() => {
    const checkHash = () => {
      const h = window.location.hash.replace('#', '').toLowerCase();
      if (h === 'organizer' || h === 'admin') setCurrentRoute('organizer');
      else if (h === 'qna') setCurrentRoute('public-qna');
      else if (h === 'stage') setCurrentRoute('stage');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Reset targetPanelist when session changes
  useEffect(() => {
    setTargetPanelist('All Panelists');
    setSelectedQuestionIdsForBulk(new Set());
  }, [selectedSessionId]);

  // Firebase Auth & Realtime Sync
  useEffect(() => {
    if (!isFirebaseActive || !auth) return;

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase auth notice:", err);
      }
    };

    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseActive || !db || !user) return;

    const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions');
    const unsubQ = onSnapshot(
      qRef,
      (snap) => {
        if (!snap.empty) {
          const items = [];
          snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
          setQuestions(items);
        }
      },
      (err) => console.warn("Firestore questions sync:", err)
    );

    const sRef = collection(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_sessions');
    const unsubS = onSnapshot(
      sRef,
      (snap) => {
        if (!snap.empty) {
          const items = [];
          snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
          setQnaSessions(items);
        }
      },
      (err) => console.warn("Firestore sessions sync:", err)
    );

    return () => {
      unsubQ();
      unsubS();
    };
  }, [user]);

  // Current selected Q&A session object
  const activeSession = useMemo(() => {
    return qnaSessions.find((s) => s.id === selectedSessionId) || qnaSessions[0];
  }, [qnaSessions, selectedSessionId]);

  // Navigate to a specific Q&A session in Public Q&A view
  const openSessionInPublicQna = (sessionId) => {
    if (sessionId) setSelectedSessionId(sessionId);
    setCurrentRoute('public-qna');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upvote Question (Public & Organizer)
  const handleUpvote = async (q) => {
    if (votedIds.has(q.id)) {
      showToast("You have already upvoted this question!");
      return;
    }
    const nextVotes = (q.votes || 0) + 1;
    setVotedIds((prev) => new Set([...prev, q.id]));

    if (isFirebaseActive && db && user) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', q.id), {
          votes: nextVotes
        });
      } catch {
        setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, votes: nextVotes } : item)));
      }
    } else {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, votes: nextVotes } : item)));
    }
    showToast("Upvote counted!");
  };

  // Submit New Question (Public Q&A)
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);

    const payload = {
      sessionId: activeSession ? activeSession.id : 'merapi-qna-1',
      sessionTitle: activeSession ? activeSession.title : 'DevFest Panel Q&A',
      targetPanelist: targetPanelist || 'All Panelists',
      authorName: isAnonymous ? 'Anonymous Attendee' : (authorName.trim() || 'DevFest Participant'),
      isAnonymous: Boolean(isAnonymous),
      text: questionText.trim(),
      votes: 1,
      isAnswered: false,
      isPinned: false,
      createdAt: Date.now()
    };

    if (isFirebaseActive && db && user) {
      try {
        const added = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions'), payload);
        setVotedIds((prev) => new Set([...prev, added.id]));
      } catch {
        const localId = `q-${Date.now()}`;
        setQuestions((prev) => [{ id: localId, ...payload }, ...prev]);
        setVotedIds((prev) => new Set([...prev, localId]));
      }
    } else {
      const localId = `q-${Date.now()}`;
      setQuestions((prev) => [{ id: localId, ...payload }, ...prev]);
      setVotedIds((prev) => new Set([...prev, localId]));
    }

    setQuestionText('');
    setSubmitting(false);
    showToast("Question submitted to the panel!");
  };

  // --- Organizer Moderation Handlers ---
  const handleOrganizerLogin = (e) => {
    e.preventDefault();
    if (organizerPin === 'devfest2026' || organizerPin === 'gdgjogja' || organizerPin === 'admin') {
      setIsOrganizerUnlocked(true);
      setPinError('');
      setOrganizerPin('');
      showToast("Organizer Moderation Page Unlocked!");
    } else {
      setPinError("Incorrect passcode. Use 'devfest2026' or click Demo Unlock.");
    }
  };

  const handleTogglePin = async (q) => {
    const nextPinned = !q.isPinned;
    if (isFirebaseActive && db && user) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', q.id), {
          isPinned: nextPinned
        });
      } catch {
        setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isPinned: nextPinned } : item)));
      }
    } else {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isPinned: nextPinned } : item)));
    }
    showToast(nextPinned ? "Pinned to top of panel feed!" : "Question unpinned.");
  };

  const handleToggleAnswered = async (q) => {
    const nextAnswered = !q.isAnswered;
    if (isFirebaseActive && db && user) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', q.id), {
          isAnswered: nextAnswered
        });
      } catch {
        setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isAnswered: nextAnswered } : item)));
      }
    } else {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isAnswered: nextAnswered } : item)));
    }
    showToast(nextAnswered ? "Marked as Answered!" : "Returned to Unanswered queue.");
  };

  const handleDeleteQuestion = async (id, reason = "Removed question") => {
    if (isFirebaseActive && db && user) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', id));
      } catch {
        setQuestions((prev) => prev.filter((item) => item.id !== id));
      }
    } else {
      setQuestions((prev) => prev.filter((item) => item.id !== id));
    }
    setSelectedQuestionIdsForBulk((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast(`${reason} from live feed.`);
  };

  const handleRemoveAllAnsweredInSession = async () => {
    const toRemove = questions.filter(
      (q) => (selectedSessionId === 'all' || q.sessionId === selectedSessionId) && q.isAnswered
    );
    if (toRemove.length === 0) {
      showToast("No answered questions to remove in this session.");
      return;
    }

    const removeIds = new Set(toRemove.map((q) => q.id));
    setQuestions((prev) => prev.filter((q) => !removeIds.has(q.id)));

    if (isFirebaseActive && db && user) {
      for (const item of toRemove) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', item.id));
        } catch (err) {
          console.warn("Bulk delete notice:", err);
        }
      }
    }
    showToast(`Cleared ${toRemove.length} answered question(s) from the session!`);
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedQuestionIdsForBulk.size === 0) return;
    const count = selectedQuestionIdsForBulk.size;
    const idsArray = Array.from(selectedQuestionIdsForBulk);

    setQuestions((prev) => prev.filter((q) => !selectedQuestionIdsForBulk.has(q.id)));
    setSelectedQuestionIdsForBulk(new Set());

    if (isFirebaseActive && db && user) {
      for (const qId of idsArray) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_questions', qId));
        } catch (err) {
          console.warn("Bulk delete notice:", err);
        }
      }
    }
    showToast(`Removed ${count} selected question(s).`);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionForm.title.trim()) return;

    const parsedPanelists = newSessionForm.panelistsCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: "DevFest Speaker / Panelist" }));

    const newSess = {
      id: `session-${Date.now()}`,
      title: newSessionForm.title.trim(),
      subtitle: newSessionForm.subtitle.trim() || "Live Panel Discussion & Audience Q&A",
      time: newSessionForm.time,
      room: newSessionForm.room,
      category: newSessionForm.category,
      accent: newSessionForm.accent,
      panelists: parsedPanelists.length > 0 ? parsedPanelists : [{ name: "All Speakers", role: "Panelist" }]
    };

    if (isFirebaseActive && db && user) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_sessions'), newSess);
      } catch {
        setQnaSessions((prev) => [...prev, newSess]);
      }
    } else {
      setQnaSessions((prev) => [...prev, newSess]);
    }

    setSelectedSessionId(newSess.id);
    setShowCreateSessionModal(false);
    setNewSessionForm({
      title: '',
      subtitle: '',
      time: '14:05–14:20 WIB',
      room: 'Stage #1 • Merapi Stage (Main Stage)',
      category: 'Main Stage Q&A',
      accent: 'blue',
      panelistsCsv: 'Speaker One, Speaker Two'
    });
    showToast("New Panel / Q&A Session Created!");
  };

  const handleDeleteSession = async (sessionId) => {
    if (qnaSessions.length <= 1) {
      showToast("At least one active Q&A session must remain.");
      return;
    }
    const remaining = qnaSessions.filter((s) => s.id !== sessionId);
    setQnaSessions(remaining);
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(remaining[0].id);
    }
    if (isFirebaseActive && db && user) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'devfest_jogja_2026_sessions', sessionId));
      } catch (e) {
        console.warn("Delete session notice:", e);
      }
    }
    showToast("Q&A Session removed.");
  };

  // Filtered Questions for Public Q&A View
  const publicFilteredQuestions = useMemo(() => {
    let list = questions.filter(
      (q) => selectedSessionId === 'all' || q.sessionId === selectedSessionId
    );

    if (qnaSort === 'popular') {
      list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (a.isAnswered !== b.isAnswered) return a.isAnswered ? 1 : -1;
        return (b.votes || 0) - (a.votes || 0);
      });
    } else if (qnaSort === 'latest') {
      list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } else if (qnaSort === 'answered') {
      list = list.filter((q) => q.isAnswered);
      list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    return list;
  }, [questions, selectedSessionId, qnaSort]);

  // Filtered Questions for Organizer Moderation Console
  const organizerFilteredQuestions = useMemo(() => {
    let list = questions.filter(
      (q) => selectedSessionId === 'all' || q.sessionId === selectedSessionId
    );
    if (organizerFilterStatus === 'active') {
      list = list.filter((q) => !q.isAnswered);
    } else if (organizerFilterStatus === 'answered') {
      list = list.filter((q) => q.isAnswered);
    }
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (b.votes || 0) - (a.votes || 0);
    });
    return list;
  }, [questions, selectedSessionId, organizerFilterStatus]);

  // Active Spotlight Question for Stage Screen
  const spotlightQuestion = useMemo(() => {
    const found = questions.find((q) => q.id === stageQuestionId);
    if (found) return found;
    return publicFilteredQuestions[0] || null;
  }, [questions, stageQuestionId, publicFilteredQuestions]);

  return (
    <div className="min-h-screen bg-[#EEF1F4] text-[#202124] flex flex-col font-body selection:bg-[#4285F4] selection:text-white">
      {/* Inject Google Fonts & Vibe / Schedule Theme Variables */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        
        :root {
          --green: #34a853;
          --green-pale: #e2efda;
          --blue: #4285f4;
          --ink: #202124;
          --muted: #5f6368;
          --line: #d7dce1;
          --soft: #f4f6f8;
          --amber: #fff3d6;
          --workshop: #f7fbff;
          --vibe: #fbf8ff;
        }
        .font-display {
          font-family: 'Plus Jakarta Sans', 'Space Grotesk', sans-serif;
        }
        .font-mono-code {
          font-family: 'JetBrains Mono', monospace;
        }
        .font-body {
          font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
        }
        .vibe-card {
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(30, 40, 50, 0.07);
        }
        .vibe-card-hover {
          transition: all 0.2s ease;
        }
        .vibe-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(30, 40, 50, 0.11);
          border-color: #b8c2cc;
        }
        .schedule-table th, .schedule-table td {
          border: 1px solid #d7dce1;
          padding: 11px 10px;
          text-align: center;
          vertical-align: middle;
          line-height: 1.4;
        }
        .schedule-table thead th {
          background: #4285f4;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
        }
        .schedule-table td.time-col {
          background: #f0f3f7;
          font-weight: 700;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          color: #202124;
        }
      `}</style>

      {/* Top Google 4-Color Accent Strip */}
      <div className="h-1.5 w-full grid grid-cols-4 sticky top-0 z-50">
        <div className="bg-[#4285F4]"></div>
        <div className="bg-[#EA4335]"></div>
        <div className="bg-[#FBBC04]"></div>
        <div className="bg-[#34A853]"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white px-5 py-3.5 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span>
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navigation Header (Public Links + Dedicated Organizer Page Tab) */}
      {currentRoute !== 'stage' && (
        <header className="sticky top-1.5 z-40 bg-white/95 backdrop-blur-md border-b border-[#D7DCE1] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex flex-wrap items-center justify-between gap-4">
            
            {/* Brand Identity with Official GDG Logo */}
            <div
              onClick={() => {
                window.location.hash = '';
                setCurrentRoute('public-landing');
              }}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F4F6F8] border border-[#D7DCE1] flex items-center justify-center p-1.5 shadow-xs group-hover:border-[#4285F4] transition-colors">
                <GdgLogo className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[#202124]">
                    DevFest <span className="text-[#4285F4]">Jogjakarta</span>
                  </span>
                  <span className="font-mono-code text-xs font-bold px-2 py-0.5 rounded-md bg-[#E2EFDA] text-[#1E7E34]">
                    2026
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6368] hidden sm:block">
                  GDG Jogjakarta • Minggu, 8 November 2026
                </p>
              </div>
            </div>

            {/* Public Navigation + Separate Organizer Page Menu */}
            <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  window.location.hash = '';
                  setCurrentRoute('public-landing');
                }}
                className={`px-3.5 py-2 rounded-lg font-display font-semibold text-xs sm:text-sm transition-colors ${
                  currentRoute === 'public-landing'
                    ? 'bg-[#4285F4] text-white shadow-sm'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F4F6F8]'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => {
                  window.location.hash = 'qna';
                  setCurrentRoute('public-qna');
                }}
                className={`px-3.5 py-2 rounded-lg font-display font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors ${
                  currentRoute === 'public-qna'
                    ? 'bg-[#4285F4] text-white shadow-sm'
                    : 'bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Q&A</span>
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
              </button>

              <a
                href={VIBE_CHALLENGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#FBF8FF] border border-[#D8B4FE] text-[#6D28D9] hover:bg-[#F3E8FF] font-display font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors"
              >
                <Flame className="w-4 h-4 text-[#7C3AED]" />
                <span>Vibe Challenge</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={BEVY_RSVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#F4F6F8] border border-[#D7DCE1] text-[#202124] hover:bg-[#E8EAED] font-display font-semibold text-xs sm:text-sm hidden md:flex items-center space-x-1.5 transition-colors"
              >
                <span>Official Bevy Event Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5F6368]" />
              </a>

              {/* Separate Organizer Page Menu Item (Moved out of Footer into Dedicated Page Route) */}
              <button
                onClick={() => {
                  window.location.hash = 'organizer';
                  setCurrentRoute('organizer');
                }}
                className={`px-3 py-2 rounded-lg font-mono-code font-semibold text-xs flex items-center space-x-1.5 border transition-colors ${
                  currentRoute === 'organizer'
                    ? 'bg-[#202124] text-[#FBBC04] border-[#202124]'
                    : 'bg-white text-[#5F6368] border-[#D7DCE1] hover:text-[#202124] hover:bg-[#F4F6F8]'
                }`}
                title="Dedicated Organizer Moderation & Stage Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Organizer Page</span>
              </button>
            </nav>

          </div>
        </header>
      )}

      {/* =======================================================================
          ROUTE 1: PUBLIC LANDING PAGE (HOME)
         ======================================================================= */}
      {currentRoute === 'public-landing' && (
        <main className="flex-1 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto space-y-8">
            
            {/* 1. HERO CONTAINER (Styled after DevFest_Speaker_Schedule & vibe.gdgjogjakarta.id) */}
            <section className="vibe-card p-4 sm:p-7 bg-white">
              {/* Native 4:1 Official Banner — Uncropped & Clean */}
              <div className="w-full overflow-hidden rounded-xl border border-[#D7DCE1] mb-6 bg-[#F4F6F8]">
                <img
                  src={OFFICIAL_BANNER_URL}
                  alt="DevFest Jogjakarta 2026 — Create, Launch, and Scale: The Blueprint for Everyday AI"
                  className="w-full h-auto block object-cover"
                />
              </div>

              {/* Event Headline & Metadata */}
              <div className="text-center max-w-4xl mx-auto space-y-4 py-2">
                <div className="inline-flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#E8F0FE] text-[#1967D2] font-mono-code text-xs font-semibold inline-flex items-center space-x-1.5">
                    <GdgLogo className="w-4 h-4" />
                    <span>GDG JOGJAKARTA ANNUAL CONFERENCE</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#E2EFDA] text-[#1E7E34] font-mono-code text-xs font-semibold">
                    MINGGU, 8 NOVEMBER 2026 • 08:00–15:00 WIB
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-[#202124] tracking-tight leading-tight">
                  DevFest Jogjakarta 2026 —{' '}
                  <span className="text-[#4285F4]">Create, Launch, and Scale:</span>{' '}
                  The Blueprint for Everyday AI
                </h1>

                <p className="text-sm sm:text-base text-[#5F6368] max-w-3xl mx-auto leading-relaxed">
                  Hadir dengan <strong>2 Main Stages</strong> (Stage #1 Merapi Stage &amp; Stage #2 Prambanan Stage), <strong>2 Hands-On Workshop Labs</strong> (Kawruh Lab &amp; Karya Lab), serta <strong>Vibe Lounge</strong> untuk sesi <em>Ask The Expert</em> dan kompetisi <em>Vibe Challenge</em>.
                </p>

                {/* Venue Info Pill */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#F4F6F8] border border-[#D7DCE1] text-xs sm:text-sm text-[#202124]">
                  <MapPin className="w-4 h-4 text-[#EA4335] shrink-0" />
                  <span className="font-semibold">
                    Garuda Spark Innovation Hub – Yogyakarta (Gedung Transformasi Digital)
                  </span>
                  <span className="text-[#5F6368]">•</span>
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] font-semibold hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Primary Hero CTAs */}
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#schedule-section"
                    className="px-5 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-display font-bold text-sm shadow-sm flex items-center space-x-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Lihat Jadwal Lengkap (Rundown)</span>
                  </a>

                  <button
                    onClick={() => setCurrentRoute('public-qna')}
                    className="px-5 py-3 rounded-xl bg-[#34A853] hover:bg-[#2D9248] text-white font-display font-bold text-sm shadow-sm flex items-center space-x-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Buka Live Q&A &amp; Ask The Expert</span>
                  </button>

                  <a
                    href={VIBE_CHALLENGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-[#FBF8FF] hover:bg-[#F3E8FF] text-[#6D28D9] border border-[#D8B4FE] font-display font-bold text-sm flex items-center space-x-2 transition-all"
                  >
                    <Flame className="w-4 h-4 text-[#7C3AED]" />
                    <span>Vibe Challenge (vibe.gdgjogjakarta.id)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </section>

            {/* 2. 5 SPACES OVERVIEW (2 MAIN STAGES, 2 WORKSHOPS, 1 VIBE LOUNGE) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="vibe-card p-5 bg-white border-t-4 border-t-[#4285F4]">
                <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2]">
                  MAIN STAGE #1
                </span>
                <h3 className="font-display font-bold text-base text-[#202124] mt-2">
                  Stage #1: Merapi Stage
                </h3>
                <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                  Main Stage untuk Keynote, sesi AI Agents, BigQuery MCP, vLLM, AI Cost, Platform Engineering, dan Q&A Panel.
                </p>
              </div>

              <div className="vibe-card p-5 bg-white border-t-4 border-t-[#4285F4]">
                <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2]">
                  MAIN STAGE #2
                </span>
                <h3 className="font-display font-bold text-base text-[#202124] mt-2">
                  Stage #2: Prambanan Stage
                </h3>
                <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                  Main Stage kedua yang memadukan topik AI Beyond GPU, Modern Web UI, QA untuk Vibe-Coded Apps, LiteRT-LLM, &amp; Voice Agent.
                </p>
              </div>

              <div className="vibe-card p-5 bg-[#F7FBFF] border-t-4 border-t-[#0284C7]">
                <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1]">
                  WORKSHOP #1
                </span>
                <h3 className="font-display font-bold text-base text-[#202124] mt-2">
                  Kawruh Lab
                </h3>
                <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                  Hands-on workshop Android Autonomous AI Assistant (Gemini &amp; Hermes) serta Native Compose AI Camera App.
                </p>
              </div>

              <div className="vibe-card p-5 bg-[#F7FBFF] border-t-4 border-t-[#0284C7]">
                <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#E0F2FE] text-[#0369A1]">
                  WORKSHOP #2
                </span>
                <h3 className="font-display font-bold text-base text-[#202124] mt-2">
                  Karya Lab
                </h3>
                <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                  Hands-on workshop Shipping AI Agent di Cloud Run (Barista Bot Ops) dan Model Musik Generatif.
                </p>
              </div>

              <div className="vibe-card p-5 bg-[#FBF8FF] border-t-4 border-t-[#7C3AED]">
                <span className="font-mono-code text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#F3E8FF] text-[#6D28D9]">
                  VIBE LOUNGE
                </span>
                <h3 className="font-display font-bold text-base text-[#202124] mt-2">
                  Vibe Challenge &amp; Ask The Expert
                </h3>
                <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                  Sprint 30 menit dengan Google AI Studio &amp; Cloud Run serta diskusi interaktif Ask The Expert #1 &amp; #2.
                </p>
              </div>
            </section>

            {/* 3. OFFICIAL EVENT RUNDOWN (CARD-BASED TRACK FILTER FORMAT ALIGNED 100% WITH HTML SCHEDULE) */}
            <section id="schedule-section" className="vibe-card p-5 sm:p-8 bg-white space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#D7DCE1]">
                <div>
                  <span className="font-mono-code text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#E8F0FE] text-[#1967D2]">
                    DEVFEST JOGJAKARTA 2026 — EVENT SCHEDULE
                  </span>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#202124] mt-2">
                    Conference Rundown &amp; Speaker Schedule
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
                    Sunday, November 8, 2026 &nbsp;|&nbsp; Garuda Spark Innovation Hub – Yogyakarta (Gedung Transformasi Digital)
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono-code text-[#5F6368]">
                  <Clock className="w-4 h-4 text-[#4285F4]" />
                  <span>08:00 – 15:00 WIB • 2 Main Stages, 2 Workshops &amp; Vibe Lounge</span>
                </div>
              </div>

              {/* Room / Stage Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: 'Semua Ruangan (All Schedule)' },
                  { id: 'Stage #1: Merapi Stage', label: 'Stage #1: Merapi Stage (Main Stage)' },
                  { id: 'Stage #2: Prambanan Stage', label: 'Stage #2: Prambanan Stage (Main Stage)' },
                  { id: 'Workshop #1: Kawruh Lab', label: 'Workshop #1: Kawruh Lab' },
                  { id: 'Workshop #2: Karya Lab', label: 'Workshop #2: Karya Lab' },
                  { id: 'Vibe Lounge', label: 'Vibe Lounge' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTrackRoom(tab.id)}
                    className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm border transition-all ${
                      selectedTrackRoom === tab.id
                        ? 'bg-[#4285F4] text-white border-[#4285F4] shadow-sm'
                        : 'bg-[#F4F6F8] text-[#202124] border-[#D7DCE1] hover:bg-[#E8EAED]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chronological Rundown Cards */}
              <div className="space-y-3.5">
                {RUNDOWN_ITEMS.filter(
                  (item) =>
                    selectedTrackRoom === 'ALL' ||
                    item.room === selectedTrackRoom ||
                    item.room === 'All Spaces'
                )
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const qCount = item.qnaSessionId
                      ? questions.filter((q) => q.sessionId === item.qnaSessionId).length
                      : 0;

                    const matchedSpeakers = (item.speakerNames || [])
                      .map((sName) =>
                        speakers.find(
                          (sp) =>
                            sp.name.toLowerCase().includes(sName.toLowerCase()) ||
                            sName.toLowerCase().includes(sp.name.toLowerCase())
                        )
                      )
                      .filter(Boolean);

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 rounded-2xl border border-[#D7DCE1] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          item.styleType === 'break'
                            ? 'bg-[#E2EFDA]/85 border-[#34A853]/30'
                            : item.styleType === 'muted'
                            ? 'bg-[#F4F5F6]'
                            : item.styleType === 'workshop'
                            ? 'bg-[#F7FBFF] border-l-4 border-l-[#0284C7]'
                            : item.styleType === 'vibe'
                            ? 'bg-[#FBF8FF] border-l-4 border-l-[#7C3AED]'
                            : item.styleType === 'qna'
                            ? 'bg-[#F0F6FF] border-l-4 border-l-[#4285F4]'
                            : 'bg-white border-l-4 border-l-[#4285F4]'
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          {/* Time & Room Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono-code text-xs font-bold px-3 py-1 rounded-lg bg-[#F0F3F7] border border-[#D7DCE1] text-[#202124]">
                              {item.time}
                            </span>
                            <span
                              className={`font-mono-code text-xs font-semibold px-3 py-1 rounded-lg ${
                                item.room.includes('Stage #1') || item.room.includes('Stage #2')
                                  ? 'bg-[#E8F0FE] text-[#1967D2]'
                                  : item.room.includes('Workshop')
                                  ? 'bg-[#E0F2FE] text-[#0369A1]'
                                  : item.room === 'Vibe Lounge'
                                  ? 'bg-[#F3E8FF] text-[#6D28D9]'
                                  : 'bg-white text-[#5F6368] border border-[#D7DCE1]'
                              }`}
                            >
                              {item.roomBadge || item.room}
                            </span>
                            <span className="font-mono-code text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-white/90 border border-[#D7DCE1] text-[#5F6368]">
                              {item.type}
                            </span>
                          </div>

                          {/* Session Title */}
                          <h3 className="font-display font-bold text-base sm:text-lg text-[#202124] leading-snug">
                            {item.title}
                          </h3>

                          {/* Speaker Avatar(s) + Name */}
                          <div className="flex flex-wrap items-center gap-3 pt-0.5">
                            {matchedSpeakers.length > 0 && (
                              <div className="flex -space-x-2 overflow-hidden">
                                {matchedSpeakers.map((sp) => (
                                  <img
                                    key={sp.id}
                                    src={sp.photo}
                                    alt={sp.name}
                                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover bg-[#F4F6F8]"
                                  />
                                ))}
                              </div>
                            )}
                            <p className="text-xs sm:text-sm font-semibold text-[#1967D2]">
                              {item.speaker}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons (Vibe Challenge Redirect or Live Q&A Deep-link) */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          {item.isVibeChallenge && (
                            <a
                              href={VIBE_CHALLENGE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-display font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>vibe.gdgjogjakarta.id</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {item.qnaSessionId && (
                            <button
                              onClick={() => openSessionInPublicQna(item.qnaSessionId)}
                              className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all ${
                                item.isQnaSlot
                                  ? 'bg-[#34A853] hover:bg-[#2D9248] text-white'
                                  : 'bg-[#4285F4] hover:bg-[#3367D6] text-white'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{item.isQnaSlot ? 'Buka Sesi Live Q&A' : 'Tanya di Live Q&A'}</span>
                              <span className="px-1.5 py-0.5 rounded-full bg-white/20 font-mono-code text-[10px]">
                                {qCount}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* 4. SPEAKER CARDS WITH OFFICIAL BEVY PHOTOS & 6 ORGANIZERS */}
            <section className="vibe-card p-5 sm:p-8 bg-white space-y-10">
              {/* Speakers Grid */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#D7DCE1]">
                  <div>
                    <span className="font-mono-code text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#E8F0FE] text-[#1967D2]">
                      SPEAKERS &amp; INSTRUCTORS
                    </span>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#202124] mt-2">
                      Pembicara DevFest Jogjakarta 2026
                    </h2>
                  </div>
                  <p className="text-xs text-[#5F6368]">
                    16 Google Developer Experts, Tech Leaders &amp; Community Speakers
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {speakers.map((spk) => (
                    <div
                      key={spk.id}
                      className="vibe-card vibe-card-hover overflow-hidden flex flex-col justify-between bg-white"
                    >
                      <div>
                        {/* Speaker Photo Header */}
                        <div className="p-5 pb-0 flex items-center space-x-4">
                          <img
                            src={spk.photo}
                            alt={`${spk.name} avatar`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#4285F4]/30 shadow-sm shrink-0 bg-[#F4F6F8]"
                          />
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm sm:text-base text-[#202124] leading-snug">
                              {spk.name}
                            </h3>
                            <p className="text-xs font-semibold text-[#4285F4] truncate mt-0.5">
                              {spk.org}
                            </p>
                            <p className="text-[11px] text-[#5F6368] line-clamp-1">
                              {spk.role}
                            </p>
                          </div>
                        </div>

                        {/* Session Topic */}
                        <div className="p-5 pt-4">
                          <span className="inline-block font-mono-code text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F0F3F7] text-[#5F6368] mb-1.5">
                            {spk.stage}
                          </span>
                          <p className="text-xs text-[#202124] font-medium line-clamp-2 leading-relaxed">
                            “{spk.topic}”
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organizers Grid (6 Organizers with Official Bevy Avatars & Proper Capitalization) */}
              <div className="pt-4 border-t border-[#D7DCE1]">
                <div className="mb-6">
                  <span className="font-mono-code text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#E2EFDA] text-[#1E7E34]">
                    GDG JOGJAKARTA TEAM
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#202124] mt-2">
                    Organizers
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizers.map((org) => (
                    <div
                      key={org.id}
                      className="p-4 rounded-xl bg-[#F4F6F8] border border-[#D7DCE1] flex items-center space-x-4"
                    >
                      <img
                        src={org.photo}
                        alt={`${org.name} avatar`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://github.com/devtorajd.png";
                        }}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <p className="font-display font-bold text-sm sm:text-base text-[#202124] truncate">
                          {org.name}
                        </p>
                        <p className="font-mono-code text-xs text-[#5F6368]">
                          {org.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. TICKET, E-TICKET EMAIL & WAITING LIST RULES (NO "CHECK TICKET STATUS ON BEVY" BUTTON) */}
            <section className="vibe-card p-6 sm:p-8 bg-[#FFFDF7] border border-[#FDE68A]">
              <div className="max-w-3xl space-y-2 mb-6">
                <span className="font-mono-code text-xs font-bold uppercase px-2.5 py-1 rounded bg-[#FFF3D6] text-[#805500]">
                  INFORMASI KEHADIRAN &amp; REGISTRASI ULANG
                </span>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#202124]">
                  Ketentuan Pemegang E-Ticket &amp; Peserta Waiting List (RSVP)
                </h2>
                <p className="text-xs sm:text-sm text-[#5F6368]">
                  Meja registrasi dibuka mulai pukul <strong>08:00 WIB</strong> dengan batas waktu prioritas (cut-off time) pukul <strong>08:45 WIB</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-white border border-[#D7DCE1] space-y-2">
                  <div className="font-mono-code text-xs font-bold text-[#1967D2]">
                    01 • PEMEGANG E-TICKET RESMI
                  </div>
                  <h4 className="font-display font-bold text-base text-[#202124]">
                    Email Konfirmasi Berisi E-Ticket
                  </h4>
                  <p className="text-xs text-[#5F6368] leading-relaxed">
                    Peserta yang sudah mendapatkan tiket pasti menerima <strong>email konfirmasi resmi yang berisi lampiran e-ticket</strong>. Harap siapkan e-ticket beserta kartu identitas (KTP/KTM) yang sesuai saat check-in sebelum pukul <strong>08:45 WIB</strong>.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#D7DCE1] space-y-2">
                  <div className="font-mono-code text-xs font-bold text-[#805500]">
                    02 • PESERTA RSVP / WAITING LIST
                  </div>
                  <h4 className="font-display font-bold text-base text-[#202124]">
                    Masuk Saat Cut-Off Time (08:45 WIB)
                  </h4>
                  <p className="text-xs text-[#5F6368] leading-relaxed">
                    Peserta yang berstatus RSVP / Waiting List memang tidak menerima email e-ticket, namun <strong>tetap diperbolehkan hadir ke lokasi</strong>. Aturannya adalah mengikuti antrean khusus waiting list dan diizinkan masuk pada saat <strong>cut-off time (08:45 WIB)</strong> selama kapasitas kursi/ruangan masih mencukupi.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#D7DCE1] space-y-2">
                  <div className="font-mono-code text-xs font-bold text-[#1E7E34]">
                    03 • KESESUAIAN IDENTITAS
                  </div>
                  <h4 className="font-display font-bold text-base text-[#202124]">
                    First Come, First Served
                  </h4>
                  <p className="text-xs text-[#5F6368] leading-relaxed">
                    Pastikan nama lengkap pada pendaftaran sesuai dengan kartu identitas resmi. Kursi di Main Stage #1, Main Stage #2, serta Workshop Labs diatur berdasarkan ketersediaan kapasitas ruangan.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </main>
      )}

      {/* =======================================================================
          ROUTE 2: PUBLIC PARTICIPANT LIVE Q&A
         ======================================================================= */}
      {currentRoute === 'public-qna' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
          
          {/* Top Session Selector & Active Panelists Card */}
          <div className="vibe-card p-6 sm:p-8 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D7DCE1]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-code text-xs font-bold px-3 py-1 rounded-full bg-[#E2EFDA] text-[#1E7E34] flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping"></span>
                    <span>LIVE Q&amp;A INTERAKTIF</span>
                  </span>
                  <span className="font-mono-code text-xs font-semibold px-3 py-1 rounded-full bg-[#F0F3F7] text-[#202124]">
                    {activeSession?.room} • {activeSession?.time}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#202124]">
                  {activeSession?.title}
                </h1>
                <p className="text-sm text-[#5F6368]">
                  {activeSession?.subtitle}
                </p>
              </div>

              {/* Switch Session Dropdown */}
              <div className="w-full lg:w-96">
                <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1.5">
                  Pilih Sesi Q&amp;A / Ask The Expert:
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-4 py-3 font-display font-bold text-sm text-[#202124] focus:outline-none focus:border-[#4285F4]"
                >
                  {qnaSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Panelists in Active Session */}
            {activeSession?.panelists && (
              <div className="pt-5">
                <span className="font-mono-code text-xs font-bold uppercase text-[#5F6368] block mb-3">
                  PANELIS &amp; NARASUMBER SESI INI:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeSession.panelists.map((p, idx) => {
                    const matchedSpeaker = speakers.find((sp) =>
                      sp.name.toLowerCase().includes(p.name.toLowerCase()) ||
                      p.name.toLowerCase().includes(sp.name.toLowerCase())
                    );
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#F4F6F8] border border-[#D7DCE1] flex items-center space-x-3"
                      >
                        <img
                          src={matchedSpeaker?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#D7DCE1] shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-[#202124] truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-[#5F6368] truncate">
                            {p.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Q&A Grid: Left = Ask Form | Right = Live Audience Upvote Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 5 Cols: Ask a Panelist Form */}
            <div className="lg:col-span-5 vibe-card p-6 bg-white sticky top-24">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-lg text-[#202124]">
                    Kirim Pertanyaan
                  </h2>
                  <p className="text-xs text-[#5F6368]">
                    Tanyakan langsung ke panelis atau vote pertanyaan peserta lain
                  </p>
                </div>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1.5">
                    ujukan Pertanyaan Ke:
                  </label>
                  <select
                    value={targetPanelist}
                    onChange={(e) => setTargetPanelist(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 font-display font-semibold text-sm text-[#202124] focus:outline-none focus:border-[#4285F4]"
                  >
                    <option value="All Panelists">🎤 Semua Panelis (All Panelists)</option>
                    {activeSession?.panelists?.map((p, idx) => (
                      <option key={idx} value={p.name}>
                        👤 {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1.5">
                    Pertanyaan Anda *
                  </label>
                  <textarea
                    rows={4}
                    required
                    maxLength={320}
                    placeholder="Tulis pertanyaan Anda untuk sesi ini..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl p-3.5 text-sm text-[#202124] placeholder-[#5F6368]/60 focus:bg-white focus:outline-none focus:border-[#4285F4] resize-none"
                  />
                  <div className="flex justify-between font-mono-code text-[11px] text-[#5F6368] mt-1">
                    <span>Patuhi Google Community Guidelines</span>
                    <span>{320 - questionText.length} karakter tersisa</span>
                  </div>
                </div>

                {!isAnonymous && (
                  <div>
                    <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1">
                      Nama / Komunitas / Kampus (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Andi - GDG Jogja / UGM"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 text-sm text-[#202124] placeholder-[#5F6368]/60 focus:bg-white focus:outline-none focus:border-[#4285F4]"
                    />
                  </div>
                )}

                <label className="flex items-center space-x-2.5 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D7DCE1] text-[#4285F4]"
                  />
                  <span className="text-xs font-medium text-[#5F6368]">
                    Kirim sebagai Anonim (Anonymous)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !questionText.trim()}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-display font-bold text-sm shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}</span>
                </button>
              </form>
            </div>

            {/* Right 7 Cols: Live Questions Feed */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Feed Filter Bar */}
              <div className="vibe-card p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="font-display font-bold text-base text-[#202124]">
                    Daftar Pertanyaan Peserta
                  </span>
                  <span className="font-mono-code text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8F0FE] text-[#1967D2]">
                    {publicFilteredQuestions.length}
                  </span>
                </div>

                <div className="flex items-center space-x-1 bg-[#F4F6F8] p-1 rounded-xl border border-[#D7DCE1] text-xs font-semibold">
                  <button
                    onClick={() => setQnaSort('popular')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      qnaSort === 'popular' ? 'bg-[#4285F4] text-white' : 'text-[#5F6368]'
                    }`}
                  >
                    🔥 Terpopuler
                  </button>
                  <button
                    onClick={() => setQnaSort('latest')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      qnaSort === 'latest' ? 'bg-[#4285F4] text-white' : 'text-[#5F6368]'
                    }`}
                  >
                    ⏱️ Terbaru
                  </button>
                  <button
                    onClick={() => setQnaSort('answered')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      qnaSort === 'answered' ? 'bg-[#4285F4] text-white' : 'text-[#5F6368]'
                    }`}
                  >
                    ✅ Terjawab
                  </button>
                </div>
              </div>

              {/* Public Question Cards */}
              {publicFilteredQuestions.length === 0 ? (
                <div className="vibe-card p-12 bg-white text-center space-y-3">
                  <MessageSquare className="w-10 h-10 text-[#5F6368]/40 mx-auto" />
                  <h3 className="font-display font-bold text-lg text-[#202124]">
                    Belum ada pertanyaan pada sesi ini
                  </h3>
                  <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
                    Jadilah yang pertama mengajukan pertanyaan untuk <strong>{activeSession?.title}</strong>!
                  </p>
                </div>
              ) : (
                publicFilteredQuestions.map((q) => {
                  const voted = votedIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`vibe-card p-5 transition-all ${
                        q.isPinned
                          ? 'bg-[#FFFDF7] border-[#FBBC04]'
                          : q.isAnswered
                          ? 'bg-[#F4FAF2] border-[#34A853]/40'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleUpvote(q)}
                          disabled={voted}
                          className={`min-w-[58px] py-3 px-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            voted
                              ? 'bg-[#E8F0FE] border-[#4285F4] text-[#1967D2]'
                              : 'bg-[#F4F6F8] hover:bg-[#E8F0FE] border-[#D7DCE1] text-[#202124]'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-[#1967D2]' : ''}`} />
                          <span className="font-mono-code font-bold text-sm mt-1">
                            {q.votes || 0}
                          </span>
                        </button>

                        {/* Question Body */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {q.isPinned && (
                              <span className="font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FFF3D6] text-[#805500] flex items-center space-x-1">
                                <Pin className="w-3 h-3" />
                                <span>Disematkan (Pinned)</span>
                              </span>
                            )}
                            {q.isAnswered && (
                              <span className="font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E2EFDA] text-[#1E7E34] flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Sudah Dijawab</span>
                              </span>
                            )}
                            <span className="font-mono-code text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#E8F0FE] text-[#1967D2]">
                              Untuk: {q.targetPanelist || 'All Panelists'}
                            </span>
                          </div>

                          <p className="font-display font-bold text-base sm:text-lg text-[#202124] leading-snug">
                            {q.text}
                          </p>

                          <div className="flex items-center space-x-2 text-xs text-[#5F6368] pt-1">
                            <span>Oleh <strong>{q.authorName}</strong></span>
                            <span>•</span>
                            <span>
                              {new Date(q.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}

            </div>

          </div>

        </main>
      )}

      {/* =======================================================================
          ROUTE 3: DEDICATED ORGANIZER MODERATION PAGE (#organizer)
         ======================================================================= */}
      {currentRoute === 'organizer' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          
          {!isOrganizerUnlocked ? (
            /* Organizer Passcode Gate */
            <div className="max-w-lg mx-auto vibe-card p-8 bg-white space-y-6 my-8">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="font-mono-code text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-[#FFF3D6] text-[#805500]">
                  HALAMAN KHUSUS TIM ORGANIZER
                </span>
                <h1 className="font-display font-extrabold text-2xl text-[#202124] pt-1">
                  Organizer Q&amp;A &amp; Stage Portal
                </h1>
                <p className="text-sm text-[#5F6368]">
                  Halaman khusus panitia GDG Jogjakarta untuk memoderasi pertanyaan Live Q&amp;A, menghapus pertanyaan yang sudah terjawab atau tidak relevan, mengelola sesi, dan membuka layar proyektor panggung.
                </p>
              </div>

              <form onSubmit={handleOrganizerLogin} className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1.5">
                    Passcode Organizer
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan passcode (devfest2026)"
                    value={organizerPin}
                    onChange={(e) => setOrganizerPin(e.target.value)}
                    className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-4 py-3 font-mono-code text-sm text-[#202124] focus:bg-white focus:outline-none focus:border-[#4285F4]"
                  />
                  {pinError && (
                    <p className="text-xs font-bold text-[#EA4335] mt-1.5">{pinError}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-display font-bold text-sm"
                  >
                    Buka Dashboard Organizer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrganizerUnlocked(true);
                      showToast("Organizer Console Unlocked!");
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#E2EFDA] hover:bg-[#C6E2B8] text-[#1E7E34] font-display font-bold text-sm"
                  >
                    ⚡ Demo Unlock (1-Klik)
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Unlocked Organizer Console Dashboard */
            <div className="space-y-6">
              
              {/* Top Organizer Control Header */}
              <div className="vibe-card p-6 sm:p-8 bg-white">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono-code text-xs font-bold px-3 py-1 rounded-full bg-[#202124] text-[#FBBC04]">
                        ORGANIZER MODERATION CONSOLE
                      </span>
                      <span className="font-mono-code text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F6F8] border border-[#D7DCE1]">
                        {questions.length} Total Pertanyaan
                      </span>
                    </div>
                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#202124]">
                      Moderasi Panel Q&amp;A &amp; Ask The Expert
                    </h1>
                    <p className="text-sm text-[#5F6368]">
                      Hapus pertanyaan yang sudah dijawab atau tidak diinginkan, kelola sesi Q&amp;A, perbarui foto pembicara dari Bevy, atau tampilkan pertanyaan ke layar panggung.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setShowPhotoManagerModal(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4F6F8] hover:bg-[#E8EAED] text-[#202124] border border-[#D7DCE1] font-display font-semibold text-xs flex items-center space-x-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-[#4285F4]" />
                      <span>Kelola Foto Bevy</span>
                    </button>

                    <button
                      onClick={() => setShowCreateSessionModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2D9248] text-white font-display font-semibold text-xs flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Buat Sesi Q&amp;A</span>
                    </button>

                    <button
                      onClick={() => setCurrentRoute('stage')}
                      className="px-4 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-display font-semibold text-xs flex items-center space-x-1.5"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Layar Proyektor Panggung</span>
                    </button>

                    <button
                      onClick={() => setIsOrganizerUnlocked(false)}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F4F6F8] text-[#5F6368] border border-[#D7DCE1] font-mono-code font-semibold text-xs flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kunci</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Session Filter & Bulk Cleanup Toolbar */}
              <div className="vibe-card p-5 bg-white space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Session Selector + Delete Session button */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-4 py-2.5 font-display font-bold text-sm text-[#202124] focus:outline-none"
                    >
                      <option value="all">🌐 Semua Sesi Q&amp;A &amp; Ask The Expert</option>
                      {qnaSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.time})
                        </option>
                      ))}
                    </select>

                    {selectedSessionId !== 'all' && (
                      <button
                        onClick={() => handleDeleteSession(selectedSessionId)}
                        className="px-3 py-2 rounded-xl bg-[#FEE2E2] text-[#B91C1C] font-mono-code font-semibold text-xs flex items-center space-x-1 hover:bg-[#FECACA]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Sesi Ini</span>
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center space-x-1 bg-[#F4F6F8] p-1 rounded-xl border border-[#D7DCE1] text-xs font-semibold">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'active', label: 'Belum Dijawab' },
                      { id: 'answered', label: 'Sudah Dijawab' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setOrganizerFilterStatus(st.id)}
                        className={`px-3 py-1.5 rounded-lg ${
                          organizerFilterStatus === st.id
                            ? 'bg-[#4285F4] text-white'
                            : 'text-[#5F6368]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dedicated Organizer Cleanup Bar */}
                <div className="pt-4 border-t border-[#D7DCE1] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-mono-code font-semibold text-[#5F6368]">
                    AKSI BERSIHKAN DAFTAR PERTANYAAN:
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {selectedQuestionIdsForBulk.size > 0 && (
                      <button
                        onClick={handleBulkDeleteSelected}
                        className="px-4 py-2 rounded-xl bg-[#EA4335] text-white font-display font-semibold text-xs flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus {selectedQuestionIdsForBulk.size} Pertanyaan Terpilih</span>
                      </button>
                    )}

                    <button
                      onClick={handleRemoveAllAnsweredInSession}
                      className="px-4 py-2 rounded-xl bg-[#FFF3D6] hover:bg-[#FDE68A] text-[#805500] font-display font-semibold text-xs flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                      <span>Hapus Semua Pertanyaan yang Sudah Dijawab</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Organizer Moderation Queue List */}
              <div className="space-y-3">
                {organizerFilteredQuestions.length === 0 ? (
                  <div className="vibe-card p-12 bg-white text-center">
                    <p className="font-display font-bold text-base text-[#5F6368]">
                      Tidak ada pertanyaan yang sesuai filter saat ini.
                    </p>
                  </div>
                ) : (
                  organizerFilteredQuestions.map((q) => {
                    const isSelected = selectedQuestionIdsForBulk.has(q.id);
                    const isSpotlight = spotlightQuestion?.id === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`vibe-card p-5 transition-all ${
                          q.isAnswered
                            ? 'bg-[#F4FAF2]'
                            : q.isPinned
                            ? 'bg-[#FFFDF7]'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Left: Checkbox + Votes + Question Details */}
                          <div className="flex items-start gap-4 flex-1">
                            <button
                              onClick={() => {
                                setSelectedQuestionIdsForBulk((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(q.id)) next.delete(q.id);
                                  else next.add(q.id);
                                  return next;
                                });
                              }}
                              className="mt-1 text-[#5F6368]"
                              title="Pilih untuk hapus massal"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-[#4285F4]" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>

                            <div className="px-3 py-2 rounded-xl bg-[#F0F3F7] text-[#202124] font-mono-code font-bold text-sm text-center min-w-[54px]">
                              <div>{q.votes || 0}</div>
                              <div className="text-[10px] text-[#5F6368]">VOTES</div>
                            </div>

                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono-code text-[11px] font-semibold px-2.5 py-0.5 rounded bg-[#E8F0FE] text-[#1967D2]">
                                  Untuk: {q.targetPanelist || 'All Panelists'}
                                </span>
                                <span className="font-mono-code text-[11px] font-medium px-2.5 py-0.5 rounded bg-[#F4F6F8] text-[#5F6368]">
                                  Dari: {q.authorName}
                                </span>
                                {q.isAnswered && (
                                  <span className="font-mono-code text-[10px] font-bold px-2 py-0.5 rounded bg-[#E2EFDA] text-[#1E7E34]">
                                    TERJAWAB
                                  </span>
                                )}
                              </div>

                              <p className="font-display font-bold text-base text-[#202124]">
                                {q.text}
                              </p>

                              <p className="font-mono-code text-[11px] text-[#5F6368]">
                                Sesi: {q.sessionTitle}
                              </p>
                            </div>
                          </div>

                          {/* Right: Organizer Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#D7DCE1]">
                            <button
                              onClick={() => {
                                setStageQuestionId(q.id);
                                showToast("Pertanyaan ditampilkan ke Layar Panggung!");
                              }}
                              className={`px-3 py-2 rounded-lg font-mono-code font-semibold text-xs flex items-center space-x-1 border ${
                                isSpotlight
                                  ? 'bg-[#4285F4] text-white border-[#4285F4]'
                                  : 'bg-white text-[#202124] border-[#D7DCE1] hover:bg-[#F4F6F8]'
                              }`}
                            >
                              <Tv className="w-3.5 h-3.5" />
                              <span>{isSpotlight ? 'Tampil di Layar' : 'Layar'}</span>
                            </button>

                            <button
                              onClick={() => handleTogglePin(q)}
                              className={`px-3 py-2 rounded-lg font-mono-code font-semibold text-xs flex items-center space-x-1 border ${
                                q.isPinned
                                  ? 'bg-[#FFF3D6] text-[#805500] border-[#FBBC04]'
                                  : 'bg-white text-[#202124] border-[#D7DCE1] hover:bg-[#F4F6F8]'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span>{q.isPinned ? 'Unpin' : 'Pin'}</span>
                            </button>

                            <button
                              onClick={() => handleToggleAnswered(q)}
                              className={`px-3 py-2 rounded-lg font-mono-code font-semibold text-xs flex items-center space-x-1 border ${
                                q.isAnswered
                                  ? 'bg-white text-[#5F6368] border-[#D7DCE1]'
                                  : 'bg-[#E2EFDA] text-[#1E7E34] border-[#34A853]/30'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{q.isAnswered ? 'Buka Lagi' : 'Tandai Terjawab'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteQuestion(q.id, "Pertanyaan terjawab dihapus")}
                              className="px-3 py-2 rounded-lg bg-[#E2EFDA] hover:bg-[#C6E2B8] text-[#1E7E34] font-mono-code font-semibold text-xs flex items-center space-x-1"
                              title="Sudah dijawab & hapus dari daftar"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Terjawab &amp; Hapus</span>
                            </button>

                            <button
                              onClick={() => handleDeleteQuestion(q.id, "Pertanyaan dihapus")}
                              className="px-3 py-2 rounded-lg bg-[#FEE2E2] hover:bg-[#FECACA] text-[#B91C1C] font-mono-code font-semibold text-xs flex items-center space-x-1"
                              title="Hapus pertanyaan yang tidak relevan / spam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </main>
      )}

      {/* Organizer Modal: Bevy Speaker Photo URL Manager */}
      {showPhotoManagerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="vibe-card max-w-2xl w-full p-6 sm:p-8 bg-white relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowPhotoManagerModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#F4F6F8] hover:bg-[#E8EAED]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-8">
              <h3 className="font-display font-extrabold text-xl text-[#202124]">
                Kelola Foto Speaker (Bevy Cloudinary URL)
              </h3>
              <p className="text-xs text-[#5F6368]">
                Seluruh 16 foto pembicara sudah menggunakan URL resmi dari Bevy (`res.cloudinary.com/startup-grind/...`). Anda juga dapat mengubah URL secara langsung di bawah ini bila diperlukan.
              </p>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {speakers.map((sp) => (
                <div key={sp.id} className="p-3 rounded-xl bg-[#F4F6F8] border border-[#D7DCE1] flex items-center gap-3">
                  <img src={sp.photo} alt={sp.name} className="w-11 h-11 rounded-full object-cover shrink-0 bg-white" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-xs text-[#202124]">{sp.name}</div>
                    <input
                      type="url"
                      value={sp.photo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSpeakers((prev) =>
                          prev.map((item) => (item.id === sp.id ? { ...item, photo: val } : item))
                        );
                      }}
                      placeholder="https://res.cloudinary.com/startup-grind/image/upload/..."
                      className="mt-1 w-full bg-white border border-[#D7DCE1] rounded-lg px-2.5 py-1 text-xs font-mono-code"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-[#D7DCE1] flex justify-end">
              <button
                onClick={() => {
                  setShowPhotoManagerModal(false);
                  showToast("Foto pembicara berhasil disimpan!");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#4285F4] text-white font-display font-bold text-xs"
              >
                Selesai &amp; Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal (Organizer Only) */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="vibe-card max-w-lg w-full p-6 sm:p-8 bg-white relative">
            <button
              onClick={() => setShowCreateSessionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#F4F6F8] hover:bg-[#E8EAED]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-extrabold text-xl text-[#202124] mb-1">
              Buat Sesi Q&amp;A Baru
            </h3>
            <p className="text-xs text-[#5F6368] mb-5">
              Tambahkan sesi diskusi panel atau Ask The Expert baru.
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1">
                  Judul Sesi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Stage #1: Merapi Stage — Fireside Chat"
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1">
                    Ruangan / Stage
                  </label>
                  <input
                    type="text"
                    value={newSessionForm.room}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, room: e.target.value })}
                    className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1">
                    Waktu (WIB)
                  </label>
                  <input
                    type="text"
                    value={newSessionForm.time}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, time: e.target.value })}
                    className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-code text-xs font-bold uppercase text-[#5F6368] mb-1">
                  Daftar Panelis (Pisahkan dengan Koma)
                </label>
                <input
                  type="text"
                  value={newSessionForm.panelistsCsv}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, panelistsCsv: e.target.value })}
                  className="w-full bg-[#F4F6F8] border border-[#D7DCE1] rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSessionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F4F6F8] text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4285F4] text-white font-display font-bold text-xs"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          ROUTE 4: AUDITORIUM STAGE LED PROJECTOR VIEW
         ======================================================================= */}
      {currentRoute === 'stage' && (
        <main className="flex-1 bg-[#202124] text-white p-6 sm:p-12 flex flex-col justify-between min-h-screen">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center">
                <GdgLogo className="w-8 h-8" />
              </div>
              <div>
                <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#8AB4F8]">
                  DEVFEST JOGJAKARTA 2026 • LIVE STAGE Q&amp;A
                </span>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                  {activeSession?.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentRoute('organizer')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-xs"
              >
                Kembali ke Organizer Page
              </button>
              <button
                onClick={() => setCurrentRoute('public-qna')}
                className="px-4 py-2 rounded-xl bg-[#4285F4] text-white font-display font-semibold text-xs"
              >
                Keluar Layar Panggung
              </button>
            </div>
          </div>

          {/* Center Stage Spotlight Question */}
          <div className="my-auto py-12 max-w-5xl mx-auto w-full text-center space-y-6">
            {spotlightQuestion ? (
              <>
                <div className="inline-flex flex-wrap items-center justify-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-[#4285F4] text-white font-mono-code text-sm font-bold">
                    Untuk: {spotlightQuestion.targetPanelist || 'All Panelists'}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-[#FBBC04] text-[#202124] font-mono-code text-sm font-bold">
                    👍 {spotlightQuestion.votes} Votes
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white leading-tight">
                  “{spotlightQuestion.text}”
                </h1>

                <p className="font-mono-code text-base text-[#81C995]">
                  Ditanyakan oleh {spotlightQuestion.authorName}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <h2 className="font-display font-extrabold text-3xl text-[#FBBC04]">
                  Menunggu Pertanyaan Berikutnya...
                </h2>
                <p className="font-mono-code text-sm text-slate-300">
                  Buka menu Live Q&amp;A untuk mengirim dan memberikan vote pada pertanyaan!
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 font-mono-code text-xs text-slate-400">
            <div>GDG JOGJAKARTA • DEVFEST JOGJAKARTA 2026</div>
            <div>VIBE CHALLENGE: <strong className="text-[#D8B4FE]">vibe.gdgjogjakarta.id</strong></div>
          </div>
        </main>
      )}

      {/* =======================================================================
          CLEAN PUBLIC FOOTER (NO SUBDOMAIN/NETLIFY MENTION, NO ORGANIZER PORTAL,
          ONLY PUBLIC LINKS, AND NO GARUDA SPARK IN BOTTOM COPYRIGHT BAR)
         ======================================================================= */}
      {currentRoute !== 'stage' && (
        <footer className="bg-white border-t border-[#D7DCE1] mt-12 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#D7DCE1]">
              
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <GdgLogo className="w-7 h-7" />
                  <span className="font-display font-extrabold text-lg text-[#202124]">
                    DevFest Jogjakarta 2026
                  </span>
                </div>
                <p className="text-xs text-[#5F6368]">
                  Create, Launch, and Scale: The Blueprint for Everyday AI — GDG Jogjakarta
                </p>
              </div>

              {/* Public Navigation Only: Official Bevy Event Page, Home, QnA, Vibe Challenge */}
              <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm font-display font-semibold text-[#5F6368]">
                <button
                  onClick={() => {
                    window.location.hash = '';
                    setCurrentRoute('public-landing');
                  }}
                  className="hover:text-[#4285F4] transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    window.location.hash = 'qna';
                    setCurrentRoute('public-qna');
                  }}
                  className="hover:text-[#4285F4] transition-colors"
                >
                  Live Q&amp;A
                </button>
                <a
                  href={VIBE_CHALLENGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6D28D9] hover:underline inline-flex items-center space-x-1"
                >
                  <span>Vibe Challenge</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={BEVY_RSVP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#4285F4] inline-flex items-center space-x-1 transition-colors"
                >
                  <span>Official Bevy Event Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

            {/* Bottom Copyright Bar (Garuda Spark Removed as Requested) */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6368] gap-4">
              <p>GDG Jogjakarta &nbsp;|&nbsp; DevFest Jogjakarta 2026</p>
              <a
                href="https://developers.google.com/community-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#202124] transition-colors"
              >
                Community Guidelines
              </a>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}