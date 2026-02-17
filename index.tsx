console.log("ENV CHECK:", import.meta.env.VITE_GEMINI_API_KEY);

import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Phone, 
  Camera, 
  User, 
  HeartPulse, 
  ShieldCheck, 
  Stethoscope, 
  Volume2, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  X,
  Smartphone,
  ChevronRight,
  Loader2,
  Hash,
  Activity,
  Plus,
  Users,
  Building2,
  Trash2
} from 'lucide-react';
import { GoogleGenAI, Type, Modality } from "@google/genai";

// --- Types & Constants ---

type Language = 'English' | 'Telugu' | 'Hindi';
type Role = 'patient' | 'caretaker' | 'nurse' | null;
type Screen = 'splash' | 'language' | 'role' | 'login' | 'dashboard' | 'calling';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  schedule: ('morning' | 'afternoon' | 'evening')[];
  instruction: string;
}

interface ManagedPatient {
  name: string;
  phone: string;
  disease: string;
  medicines: Medicine[];
}

interface UserData {
  name: string;
  phone: string;
  disease: string;
  hospitalName?: string;
}

const TRANSLATIONS = {
  English: {
    startCare: 'Start Care',
    chooseLang: 'Which language do you prefer?',
    whoAreYou: 'Who are you?',
    patient: 'Patient',
    caretaker: 'Caretaker',
    nurse: 'Nurse',
    login: 'Login',
    name: 'Full Name',
    phone: 'Phone Number',
    otp: 'OTP',
    disease: 'Primary Condition',
    hospitalName: 'Hospital Name',
    scanPrescription: 'Scan Prescription',
    testCall: 'Test Reminder Call',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    scanning: 'Scanning Prescription...',
    welcome: 'Welcome',
    logout: 'Logout',
    callIncoming: 'Incoming Call',
    noMeds: 'No medicines listed.',
    readAloud: 'Read Aloud',
    quickSelect: 'Quick Select',
    addRelative: 'Add Relative',
    addPatient: 'Add Patient',
    managedPatients: 'Managed Patients',
    relPhone: "Phone Number",
    relName: "Name",
    addBtn: 'Add Person',
    addMed: 'Add Medicine',
    medName: 'Medicine Name',
    dosage: 'Dosage',
    instruction: 'Instruction',
    saveMed: 'Save Medicine',
    back: 'Back to List',
    viewMeds: 'View Schedule'
  },
  Telugu: {
    startCare: 'సంరక్షణ ప్రారంభించండి',
    chooseLang: 'మీరు ఏ భాషను ఇష్టపడతారు?',
    whoAreYou: 'మీరు ఎవరు?',
    patient: 'రోగి',
    caretaker: 'సంరక్షకుడు',
    nurse: 'నర్స్',
    login: 'లాగిన్',
    name: 'పూర్తి పేరు',
    phone: 'ఫోన్ నంబర్',
    otp: 'OTP',
    disease: 'ప్రధాన వ్యాధి',
    hospitalName: 'ఆసుపత్రి పేరు',
    scanPrescription: 'ప్రిస్క్రిప్షన్ స్కాన్ చేయండి',
    testCall: 'టెస్ట్ రిమైండర్ కాల్',
    morning: 'ఉదయం',
    afternoon: 'మధ్యాహ్నం',
    evening: 'సాయంత్రం',
    scanning: 'ప్రిస్క్రిప్షన్ స్కాన్ చేస్తోంది...',
    welcome: 'స్వాగతం',
    logout: 'లాగ్ అవుట్',
    callIncoming: 'ఇన్కమింగ్ కాల్',
    noMeds: 'మందులు లేవు.',
    readAloud: 'వినిపించు',
    quickSelect: 'త్వరిత ఎంపిక',
    addRelative: 'బంధువును జోడించండి',
    addPatient: 'రోగిని జోడించండి',
    managedPatients: 'నిర్వహించబడే రోగులు',
    relPhone: "ఫోన్ నంబర్",
    relName: "పేరు",
    addBtn: 'వ్యక్తిని జోడించండి',
    addMed: 'మందును జోడించండి',
    medName: 'మందు పేరు',
    dosage: 'మోతాదు',
    instruction: 'సూచన',
    saveMed: 'మందును సేవ్ చేయండి',
    back: 'జాబితాకు తిరిగి వెళ్ళు',
    viewMeds: 'షెడ్యూల్ చూడండి'
  },
  Hindi: {
    startCare: 'देखभाल शुरू करें',
    chooseLang: 'आप कौन सी भाषा पसंद करते हैं?',
    whoAreYou: 'आप कौन हैं?',
    patient: 'मरीज',
    caretaker: 'देखभाल करने वाला',
    nurse: 'नर्स',
    login: 'लॉगिन',
    name: 'पूरा नाम',
    phone: 'फ़ोन नंबर',
    otp: 'ओटीपी',
    disease: 'मुख्य बीमारी',
    hospitalName: 'अस्पताल का नाम',
    scanPrescription: 'पर्चा स्कैन करें',
    testCall: 'टेस्ट रिमाइंडर कॉल',
    morning: 'सुबह',
    afternoon: 'दोपहर',
    evening: 'शाम',
    scanning: 'पर्चा स्कैन किया जा रहा है...',
    welcome: 'स्वागत है',
    logout: 'लॉग आउट',
    callIncoming: 'आने वाली कॉल',
    noMeds: 'कोई दवा नहीं है।',
    readAloud: 'ज़ोर से पढ़ें',
    quickSelect: 'त्वरित चयन',
    addRelative: 'रिश्तेदार जोड़ें',
    addPatient: 'मरीज जोड़ें',
    managedPatients: 'प्रबंधित मरीज',
    relPhone: "फ़ोन नंबर",
    relName: "नाम",
    addBtn: 'व्यक्ति जोड़ें',
    addMed: 'दवा जोड़ें',
    medName: 'दवा का नाम',
    dosage: 'खुराक',
    instruction: 'निर्देश',
    saveMed: 'दवा सहेजें',
    back: 'सूची पर वापस जाएं',
    viewMeds: 'शेड्यूल देखें'
  }
};

const COMMON_DISEASES = ['Fever', 'Diabetes', 'Hypertension', 'Cough', 'Body Pain', 'Wellness'];

// --- Utilities ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Sub-Components ---

const SplashScreen = ({ t, onStart }: { t: any, onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1e] text-white p-6 relative overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
    <div className="relative mb-8 animate-pulse">
      <div className="w-32 h-32 bg-blue-600 rounded-[2rem] flex items-center justify-center rotate-45 transform shadow-2xl shadow-blue-500/30">
        <HeartPulse className="w-16 h-16 text-white -rotate-45" size={48} />
      </div>
    </div>
    <h1 className="text-4xl font-bold mb-12 tracking-wider">Med<span className="text-blue-400">Rush</span></h1>
    <button 
      onClick={onStart}
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 group"
    >
      {t.startCare} <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
    </button>
  </div>
);

const LanguageScreen = ({ t, onSelect }: { t: any, onSelect: (l: Language) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1e] text-white p-6 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent" />
    <h2 className="text-2xl font-semibold mb-10 text-center relative z-10">{t.chooseLang}</h2>
    <div className="grid grid-cols-1 gap-4 w-full max-w-xs relative z-10">
      {(['English', 'Telugu', 'Hindi'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => onSelect(l)}
          className="py-4 px-6 rounded-2xl border-2 border-white/5 bg-white/5 hover:bg-white/10 transition-all text-lg font-medium"
        >
          {l}
        </button>
      ))}
    </div>
  </div>
);

const RoleScreen = ({ t, onSelect }: { t: any, onSelect: (r: Role) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1e] text-white p-6 relative">
    <h2 className="text-2xl font-semibold mb-10 text-center">{t.whoAreYou}</h2>
    <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
      <button onClick={() => onSelect('patient')} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <User className="text-blue-400" />
        </div>
        <span className="text-lg font-medium">{t.patient}</span>
      </button>
      <button onClick={() => onSelect('caretaker')} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <ShieldCheck className="text-blue-400" />
        </div>
        <span className="text-lg font-medium">{t.caretaker}</span>
      </button>
      <button onClick={() => onSelect('nurse')} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Stethoscope className="text-blue-400" />
        </div>
        <span className="text-lg font-medium">{t.nurse}</span>
      </button>
    </div>
  </div>
);

const LoginScreen = ({ t, role, userData, setUserData, onLogin }: any) => (
  <div className="flex flex-col min-h-screen bg-[#0a0b1e] text-white p-6 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-blue-600/10 blur-[100px] rounded-full" />
    <div className="flex-1 max-w-md mx-auto w-full py-12 relative z-10">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold mb-2 uppercase tracking-tighter">
          {role === 'nurse' ? t.nurse : (role === 'caretaker' ? t.caretaker : t.patient)} {t.login}
        </h2>
        <p className="text-white/40">Secure access to MedRush Network</p>
      </div>
      <div className="space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-1">{t.name}</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              placeholder="Full Name"
              value={userData.name}
              onChange={(e) => setUserData((prev: any) => ({...prev, name: e.target.value}))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-1">{t.phone}</label>
          <div className="flex gap-3">
            <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-4 text-white/60 font-medium">+91</div>
            <div className="relative flex-1 group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="tel" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="Phone Number"
                value={userData.phone}
                onChange={(e) => setUserData((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10)}))}
              />
            </div>
          </div>
        </div>
        
        {role === 'nurse' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-1">{t.hospitalName}</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="City Hospital"
                value={userData.hospitalName || ''}
                onChange={(e) => setUserData((prev: any) => ({...prev, hospitalName: e.target.value}))}
              />
            </div>
          </div>
        )}

        <div className={`grid gap-6 ${role === 'patient' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
           <div className="space-y-2">
            <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-1">{t.otp}</label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input type="text" maxLength={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-center tracking-[0.5em] font-bold" placeholder="••••" />
            </div>
          </div>
          {role === 'patient' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider ml-1">{t.disease}</label>
              <div className="relative group">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Fever"
                  value={userData.disease}
                  onChange={(e) => setUserData((prev: any) => ({...prev, disease: e.target.value}))}
                />
              </div>
            </div>
          )}
        </div>

        {role === 'patient' && (
          <div className="space-y-2">
            <span className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">{t.quickSelect}</span>
            <div className="flex flex-wrap gap-2">
              {COMMON_DISEASES.map(d => (
                <button key={d} type="button" onClick={() => setUserData((prev: any) => ({...prev, disease: d}))} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${userData.disease === d ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
        <button onClick={onLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl mt-4 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
          {t.login} <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  </div>
);

const MedicineColumn = ({ title, time, medicines, t }: { title: string, time: 'morning' | 'afternoon' | 'evening', medicines: Medicine[], t: any }) => {
  const filtered = medicines.filter(m => m.schedule.includes(time));
  return (
    <div className="flex-1 min-w-[280px] bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg"><Clock className="text-blue-400" size={20} /></div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((med, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-blue-400/40 transition-all group">
            <div className="flex justify-between items-start mb-2 gap-2">
              <span className="font-bold text-white text-lg leading-tight group-hover:text-blue-400 transition-colors">{med.name}</span>
              <span className="text-[10px] uppercase tracking-widest bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md shrink-0 border border-blue-500/20">{med.dosage}</span>
            </div>
            <p className="text-sm text-white/50 italic">"{med.instruction}"</p>
          </div>
        )) : (
          <div className="py-10 text-center text-white/20 flex flex-col items-center gap-2">
             <div className="w-10 h-10 border-2 border-dashed border-white/10 rounded-full" />
             <p className="text-sm">{t.noMeds}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardScreen = ({ t, role, userData, medicines, managedPatients, onAddPatient, onUpdatePatientMeds, isScanning, onLogout, onScan, onStartCall, onSpeak, isPlayingAudio }: any) => {
  const [selectedPatientIdx, setSelectedPatientIdx] = useState<number | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  
  // New Med Form State
  const [mName, setMName] = useState('');
  const [mDosage, setMDosage] = useState('');
  const [mInstr, setMInstr] = useState('');
  const [mSchedule, setMSchedule] = useState<('morning' | 'afternoon' | 'evening')[]>([]);

  const handleAddPerson = () => {
    if (newPersonName && newPersonPhone) {
      onAddPatient({ name: newPersonName, phone: newPersonPhone, disease: 'Awaiting diagnosis', medicines: [] });
      setNewPersonName('');
      setNewPersonPhone('');
    }
  };

  const handleAddMedicine = () => {
    if (selectedPatientIdx !== null && mName) {
      const newMed: Medicine = {
        name: mName,
        dosage: mDosage,
        frequency: mSchedule.length + ' times a day',
        schedule: mSchedule,
        instruction: mInstr
      };
      const updatedMeds = [...managedPatients[selectedPatientIdx].medicines, newMed];
      onUpdatePatientMeds(selectedPatientIdx, updatedMeds);
      setMName('');
      setMDosage('');
      setMInstr('');
      setMSchedule([]);
    }
  };

  const selectedPatient = selectedPatientIdx !== null ? managedPatients[selectedPatientIdx] : null;

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white p-4 md:p-12 overflow-x-hidden relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/5 blur-[120px] rounded-full" />
      
      <header className="flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            {role === 'caretaker' ? <ShieldCheck className="text-blue-400" /> : (role === 'nurse' ? <Stethoscope className="text-blue-400" /> : <User className="text-blue-400" />)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.welcome}, {userData.name || 'Guest'}</h1>
            <p className="text-white/40 text-sm flex items-center gap-1.5 font-medium uppercase tracking-widest text-[10px]">
              {role === 'nurse' && <><Building2 size={12} className="text-blue-500" /> {userData.hospitalName}</>}
              {role === 'patient' && <><Activity size={12} className="text-blue-500" /> {userData.disease || 'Wellness'}</>}
              {role === 'caretaker' && <><ShieldCheck size={12} className="text-blue-500" /> {t.caretaker}</>}
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl text-white/40 hover:text-white transition-all flex items-center gap-2">
          <LogOut size={20} /> <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">{t.logout}</span>
        </button>
      </header>

      {role === 'patient' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
            <label className="relative flex flex-col items-center justify-center h-48 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 cursor-pointer transition-all group overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
              {isScanning ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-blue-400" size={40} />
                  <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">{t.scanning}</span>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="text-white/40 group-hover:text-blue-400 transition-colors" size={32} />
                  </div>
                  <span className="font-bold text-xl">{t.scanPrescription}</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={onScan} />
            </label>
            <button onClick={onStartCall} className="flex flex-col items-center justify-center h-48 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-blue-500/50 transition-all group shadow-2xl overflow-hidden">
              <div className="relative w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="text-white/40 group-hover:text-blue-400 transition-colors" size={32} />
              </div>
              <span className="font-bold text-xl">{t.testCall}</span>
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 pb-12 relative z-10">
            <MedicineColumn title={t.morning} time="morning" medicines={medicines} t={t} />
            <MedicineColumn title={t.afternoon} time="afternoon" medicines={medicines} t={t} />
            <MedicineColumn title={t.evening} time="evening" medicines={medicines} t={t} />
          </div>
        </>
      ) : (
        <div className="space-y-12 relative z-10">
          {selectedPatient ? (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500">
               <button onClick={() => setSelectedPatientIdx(null)} className="mb-6 flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">
                 <ChevronRight className="rotate-180" size={16} /> {t.back}
               </button>
               <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedPatient.name}</h2>
                    <p className="text-white/40 flex items-center gap-2 mt-1"><Phone size={14} /> +91 {selectedPatient.phone}</p>
                  </div>
                  {role === 'nurse' && (
                     <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                       <Stethoscope className="text-blue-400" />
                     </div>
                  )}
               </div>

               {role === 'nurse' && (
                 <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 mb-12">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-blue-400" /> {t.addMed}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <input value={mName} onChange={e => setMName(e.target.value)} placeholder={t.medName} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                      <input value={mDosage} onChange={e => setMDosage(e.target.value)} placeholder={t.dosage} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                      <input value={mInstr} onChange={e => setMInstr(e.target.value)} placeholder={t.instruction} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50" />
                      <div className="flex gap-2">
                        {(['morning', 'afternoon', 'evening'] as const).map(time => (
                          <button 
                            key={time} 
                            onClick={() => setMSchedule(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                            className={`flex-1 rounded-xl text-[10px] font-bold uppercase transition-all ${mSchedule.includes(time) ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40'}`}
                          >
                            {time[0]}
                          </button>
                        ))}
                      </div>
                   </div>
                   <button onClick={handleAddMedicine} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                     {t.saveMed}
                   </button>
                 </div>
               )}

               <div className="flex flex-col lg:flex-row gap-6 pb-12">
                  <MedicineColumn title={t.morning} time="morning" medicines={selectedPatient.medicines} t={t} />
                  <MedicineColumn title={t.afternoon} time="afternoon" medicines={selectedPatient.medicines} t={t} />
                  <MedicineColumn title={t.evening} time="evening" medicines={selectedPatient.medicines} t={t} />
               </div>
            </div>
          ) : (
            <>
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl max-w-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    {role === 'nurse' ? <Stethoscope className="text-blue-400" /> : <Plus className="text-blue-400" />}
                  </div>
                  <h2 className="text-2xl font-bold">{role === 'nurse' ? t.addPatient : t.addRelative}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.relName}</label>
                    <input value={newPersonName} onChange={e => setNewPersonName(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder={t.relName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.relPhone}</label>
                    <input value={newPersonPhone} onChange={e => setNewPersonPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="9876543210" />
                  </div>
                </div>
                <button onClick={handleAddPerson} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group">
                   {t.addBtn} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <Users className="text-blue-400" />
                  <h2 className="text-2xl font-bold">{t.managedPatients}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {managedPatients.map((p: any, i: number) => (
                    <div key={i} onClick={() => setSelectedPatientIdx(i)} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-blue-500/50 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                          <User className="text-white/60 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{p.name}</h3>
                          <div className="flex items-center gap-2 text-white/40 text-xs mt-0.5"><Phone size={12} /> +91 {p.phone}</div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{p.medicines.length} Medicines</span>
                         <div className="flex items-center gap-1 text-blue-400 text-xs font-bold uppercase tracking-tighter group-hover:gap-2 transition-all">
                           {t.viewMeds} <ChevronRight size={14} />
                         </div>
                      </div>
                    </div>
                  ))}
                  {managedPatients.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <Users className="mx-auto text-white/5 mb-4" size={48} />
                      <p className="text-white/20 font-medium">No people managed yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const MedRushApp = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [lang, setLang] = useState<Language>('English');
  const [role, setRole] = useState<Role>(null);
  const [userData, setUserData] = useState<UserData>({ name: '', phone: '', disease: '', hospitalName: '' });
  const [managedPatients, setManagedPatients] = useState<ManagedPatient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallAnswered, setIsCallAnswered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = TRANSLATIONS[lang];
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  };

  const handleSpeak = async (text: string) => {
    initAudio();
    setIsPlayingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say this in ${lang}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio && audioContextRef.current) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
      }
    } catch (e) { setIsPlayingAudio(false); }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Data = (ev.target?.result as string).split(',')[1];
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { mimeType: file.type, data: base64Data } }, { text: "Extract medicine details. Return JSON {medicines: [{name, dosage, frequency, schedule:[], instruction}]}." }] },
          config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                medicines: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      dosage: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      schedule: { type: Type.ARRAY, items: { type: Type.STRING } },
                      instruction: { type: Type.STRING }
                    },
                    required: ["name", "dosage", "frequency", "schedule", "instruction"]
                  }
                }
              }
            }
          }
        });
        const data = JSON.parse(response.text || '{}');
        if (data.medicines) setMedicines(data.medicines);
      } catch (err) { console.error(err); } finally { setIsScanning(false); }
    };
    reader.readAsDataURL(file);
  };

  const answerCall = async () => {
    setIsCallAnswered(true);
    const medList = medicines.map(m => m.name).join(', ');
    const msg = medicines.length > 0 ? `Hello ${userData.name}, take medicines: ${medList}.` : `Hello ${userData.name}, MedRush reminder.`;
    await handleSpeak(msg);
    setTimeout(() => { setIsCalling(false); setIsCallAnswered(false); }, 10000);
  };

  return (
    <div className="font-sans min-h-screen bg-[#0a0b1e]">
      {screen === 'splash' && <SplashScreen t={t} onStart={() => setScreen('language')} />}
      {screen === 'language' && <LanguageScreen t={t} onSelect={(l) => { setLang(l); setScreen('role'); }} />}
      {screen === 'role' && <RoleScreen t={t} onSelect={(r) => { setRole(r); setScreen('login'); }} />}
      {screen === 'login' && <LoginScreen t={t} role={role} userData={userData} setUserData={setUserData} onLogin={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && (
        <DashboardScreen 
          t={t} 
          role={role}
          userData={userData} 
          medicines={medicines} 
          managedPatients={managedPatients}
          onAddPatient={(p: ManagedPatient) => setManagedPatients(prev => [...prev, p])}
          onUpdatePatientMeds={(idx: number, meds: Medicine[]) => {
            setManagedPatients(prev => prev.map((p, i) => i === idx ? { ...p, medicines: meds } : p));
          }}
          isScanning={isScanning}
          onLogout={() => { setScreen('splash'); setRole(null); setUserData({ name: '', phone: '', disease: '' }); }}
          onScan={handleScan}
          onStartCall={() => setIsCalling(true)}
          onSpeak={handleSpeak}
          isPlayingAudio={isPlayingAudio}
        />
      )}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-[#0a0b1e] flex flex-col items-center justify-between p-12 text-white">
           <div className="flex flex-col items-center mt-20">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <HeartPulse size={48} />
              </div>
              <h2 className="text-3xl font-bold">MedRush</h2>
              <p className="text-blue-400 font-medium">{t.callIncoming}</p>
           </div>
           <div className="flex gap-12 mb-20">
              {!isCallAnswered ? (
                <>
                  <button onClick={() => setIsCalling(false)} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X size={32} /></button>
                  <button onClick={answerCall} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"><Phone size={32} /></button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-2 h-10 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                  </div>
                  <button onClick={() => setIsCalling(false)} className="mt-8 bg-white/10 px-8 py-3 rounded-full">End Call</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<MedRushApp />);
