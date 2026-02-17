
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
  Trash2,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldAlert
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
  note?: string;
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
    scanning: 'Analyzing Prescription...',
    scanError: 'Scan Failed. Check if API_KEY is set in Vercel.',
    scanSuccess: 'Medicines extracted successfully!',
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
    note: 'Special Note',
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
    scanning: 'ప్రిస్క్రిప్షన్ విశ్లేషిస్తోంది...',
    scanError: 'స్కాన్ విఫలమైంది. Vercelలో API_KEYని తనిఖీ చేయండి.',
    scanSuccess: 'మందుల వివరాలు విజయవంతంగా పొందబడ్డాయి!',
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
    note: 'ప్రత్యేక గమనిక',
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
    scanning: 'पर्चा विश्लेषण किया जा रहा है...',
    scanError: 'स्कैन विफल रहा। Vercel में API_KEY की जाँच करें।',
    scanSuccess: 'दवाओं का विवरण सफलतापूर्वक निकाला गया!',
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
    note: 'विशेष नोट',
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
    <div className="relative mb-8 animate-bounce">
      <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 border border-white/10">
        <HeartPulse className="w-16 h-16 text-white" size={64} />
      </div>
    </div>
    <h1 className="text-5xl font-black mb-4 tracking-tighter italic">Med<span className="text-blue-400">Rush</span></h1>
    <p className="text-white/40 font-medium tracking-[0.3em] uppercase text-[10px] mb-12">Precision Care Ecosystem</p>
    <button 
      onClick={onStart}
      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-14 rounded-3xl shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-3 group text-xl"
    >
      {t.startCare} <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
    </button>
  </div>
);

const LanguageScreen = ({ t, onSelect }: { t: any, onSelect: (l: Language) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1e] text-white p-6 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent" />
    <h2 className="text-3xl font-bold mb-12 text-center relative z-10">{t.chooseLang}</h2>
    <div className="grid grid-cols-1 gap-6 w-full max-w-sm relative z-10">
      {(['English', 'Telugu', 'Hindi'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => onSelect(l)}
          className="group py-6 px-10 rounded-[2rem] border-2 border-white/5 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-xl font-bold flex justify-between items-center"
        >
          {l}
          <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  </div>
);

const RoleScreen = ({ t, onSelect }: { t: any, onSelect: (r: Role) => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0b1e] text-white p-6 relative">
    <h2 className="text-3xl font-bold mb-12 text-center">{t.whoAreYou}</h2>
    <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
      <button onClick={() => onSelect('patient')} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <User className="text-blue-400" size={32} />
        </div>
        <span className="text-xl font-bold">{t.patient}</span>
      </button>
      <button onClick={() => onSelect('caretaker')} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <ShieldCheck className="text-blue-400" size={32} />
        </div>
        <span className="text-xl font-bold">{t.caretaker}</span>
      </button>
      <button onClick={() => onSelect('nurse')} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group text-left">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Stethoscope className="text-blue-400" size={32} />
        </div>
        <span className="text-xl font-bold">{t.nurse}</span>
      </button>
    </div>
  </div>
);

const LoginScreen = ({ t, role, userData, setUserData, onLogin }: any) => (
  <div className="flex flex-col min-h-screen bg-[#0a0b1e] text-white p-6 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-blue-600/10 blur-[100px] rounded-full" />
    <div className="flex-1 max-w-md mx-auto w-full py-12 relative z-10">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold mb-2 uppercase tracking-tighter">
          {role === 'nurse' ? t.nurse : (role === 'caretaker' ? t.caretaker : t.patient)} {t.login}
        </h2>
        <p className="text-white/40">Secure verification portal</p>
      </div>
      <div className="space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.name}</label>
          <input 
            type="text" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="John Doe"
            value={userData.name}
            onChange={(e) => setUserData((prev: any) => ({...prev, name: e.target.value}))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.phone}</label>
          <input 
            type="tel" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
            placeholder="9876543210"
            value={userData.phone}
            onChange={(e) => setUserData((prev: any) => ({...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10)}))}
          />
        </div>
        
        {role === 'nurse' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.hospitalName}</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
              placeholder="City General Hospital"
              value={userData.hospitalName || ''}
              onChange={(e) => setUserData((prev: any) => ({...prev, hospitalName: e.target.value}))}
            />
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.otp}</label>
            <input type="text" maxLength={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-center tracking-[0.5em] font-bold" placeholder="••••" />
          </div>
          {role === 'patient' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.disease}</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="e.g. Diabetes"
                value={userData.disease}
                onChange={(e) => setUserData((prev: any) => ({...prev, disease: e.target.value}))}
              />
            </div>
          )}
        </div>

        <button onClick={onLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl mt-4 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 text-lg">
          {t.login} <CheckCircle2 size={24} />
        </button>
      </div>
    </div>
  </div>
);

const MedicineColumn = ({ title, time, medicines, t, onSpeak, isPlayingAudio }: { title: string, time: 'morning' | 'afternoon' | 'evening', medicines: Medicine[], t: any, onSpeak: (m: Medicine) => void, isPlayingAudio: boolean }) => {
  const filtered = medicines.filter(m => m.schedule.includes(time));
  return (
    <div className="flex-1 min-w-[300px] bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20"><Clock className="text-blue-400" size={24} /></div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <div className="space-y-6">
        {filtered.length > 0 ? filtered.map((med, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-blue-500/50 transition-all group animate-in slide-in-from-bottom-2 fade-in duration-300 relative">
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex-1">
                <span className="font-bold text-white text-xl block leading-tight group-hover:text-blue-400 transition-colors">{med.name}</span>
                <span className="text-[10px] inline-block mt-2 uppercase tracking-[0.2em] bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg border border-blue-500/20 font-bold">{med.dosage}</span>
              </div>
              <button 
                onClick={() => onSpeak(med)}
                disabled={isPlayingAudio}
                className={`p-4 rounded-2xl transition-all active:scale-90 ${isPlayingAudio ? 'bg-blue-600 text-white animate-pulse shadow-lg' : 'bg-white/5 text-white/40 hover:text-blue-400 hover:bg-white/10'}`}
                title={t.readAloud}
              >
                <Volume2 size={24} />
              </button>
            </div>
            <div className="space-y-3 mt-4">
              <p className="text-sm text-white/70 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <FileText size={16} className="mt-0.5 shrink-0 text-blue-400/60" />
                <span className="font-medium">{med.instruction}</span>
              </p>
              {med.note && (
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <p className="text-[11px] text-red-200 font-bold leading-relaxed italic">
                      {med.note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="py-16 text-center text-white/20 flex flex-col items-center gap-4">
             <div className="w-16 h-16 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center">
               <Activity size={24} className="opacity-20" />
             </div>
             <p className="text-sm font-bold uppercase tracking-widest">{t.noMeds}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardScreen = ({ t, role, userData, medicines, managedPatients, onAddPatient, onUpdatePatientMeds, isScanning, onLogout, onScan, onStartCall, onSpeak, isPlayingAudio, scanMessage }: any) => {
  const [selectedPatientIdx, setSelectedPatientIdx] = useState<number | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  
  // New Med Form State
  const [mName, setMName] = useState('');
  const [mDosage, setMDosage] = useState('');
  const [mInstr, setMInstr] = useState('');
  const [mNote, setMNote] = useState('');
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
        instruction: mInstr,
        note: mNote
      };
      const updatedMeds = [...managedPatients[selectedPatientIdx].medicines, newMed];
      onUpdatePatientMeds(selectedPatientIdx, updatedMeds);
      setMName('');
      setMDosage('');
      setMInstr('');
      setMNote('');
      setMSchedule([]);
    }
  };

  const selectedPatient = selectedPatientIdx !== null ? managedPatients[selectedPatientIdx] : null;

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white p-4 md:p-12 overflow-x-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/5 blur-[150px] rounded-full" />
      
      {scanMessage && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[1.5rem] flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl animate-in fade-in slide-in-from-top-10 duration-500 ${scanMessage.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-green-500/20 border-green-500/50 text-green-200'}`}>
          {scanMessage.type === 'error' ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
          <span className="text-base font-bold">{scanMessage.text}</span>
        </div>
      )}

      <header className="flex justify-between items-center mb-16 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-2xl">
            {role === 'caretaker' ? <ShieldCheck className="text-blue-400" size={32} /> : (role === 'nurse' ? <Stethoscope className="text-blue-400" size={32} /> : <User className="text-blue-400" size={32} />)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.welcome}, {userData.name || 'User'}</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
              <Activity size={12} className="text-blue-500" />
              {role === 'nurse' ? userData.hospitalName : userData.disease || 'Wellness Monitor'}
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-white/5 hover:bg-red-500/10 border border-white/10 p-4 rounded-2xl text-white/40 hover:text-red-400 transition-all active:scale-95 group">
          <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {role === 'patient' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
            <label className={`relative flex flex-col items-center justify-center h-56 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-blue-500/50 cursor-pointer transition-all group overflow-hidden shadow-2xl ${isScanning ? 'pointer-events-none opacity-80' : ''}`}>
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
              {isScanning ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-blue-400" size={56} />
                  <span className="text-blue-400 font-black tracking-[0.2em] text-xs uppercase animate-pulse">{t.scanning}</span>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
                    <Camera className="text-white/30 group-hover:text-blue-400 transition-colors" size={40} />
                  </div>
                  <span className="font-bold text-2xl tracking-tight">{t.scanPrescription}</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" capture="environment" onChange={onScan} />
            </label>
            <button onClick={onStartCall} className="flex flex-col items-center justify-center h-56 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-blue-500/50 transition-all group shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/5 transition-colors" />
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all shadow-xl">
                <Smartphone className="text-white/30 group-hover:text-blue-400 transition-colors" size={40} />
              </div>
              <span className="font-bold text-2xl tracking-tight">{t.testCall}</span>
            </button>
          </div>
          <div className="flex flex-col xl:flex-row gap-8 pb-16 relative z-10">
            <MedicineColumn title={t.morning} time="morning" medicines={medicines} t={t} onSpeak={(m) => onSpeak(`Time for your ${m.name}. Take ${m.dosage}. ${m.instruction}. ${m.note ? 'Please note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
            <MedicineColumn title={t.afternoon} time="afternoon" medicines={medicines} t={t} onSpeak={(m) => onSpeak(`Time for your ${m.name}. Take ${m.dosage}. ${m.instruction}. ${m.note ? 'Please note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
            <MedicineColumn title={t.evening} time="evening" medicines={medicines} t={t} onSpeak={(m) => onSpeak(`Time for your ${m.name}. Take ${m.dosage}. ${m.instruction}. ${m.note ? 'Please note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
          </div>
        </>
      ) : (
        <div className="space-y-16 relative z-10">
          {selectedPatient ? (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700">
               <button onClick={() => setSelectedPatientIdx(null)} className="mb-8 flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full border border-white/10">
                 <ChevronRight className="rotate-180" size={16} /> {t.back}
               </button>
               <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 mb-10 flex justify-between items-center shadow-2xl">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2">{selectedPatient.name}</h2>
                    <p className="text-white/40 flex items-center gap-3 text-lg font-medium"><Phone size={20} className="text-blue-500/50" /> +91 {selectedPatient.phone}</p>
                  </div>
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                    {role === 'nurse' ? <Stethoscope size={40} className="text-blue-400" /> : <ShieldCheck size={40} className="text-blue-400" />}
                  </div>
               </div>

               {role === 'nurse' && (
                 <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 mb-12 shadow-xl">
                   <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><Plus className="text-blue-400" /> {t.addMed}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/40">{t.medName}</label>
                        <input value={mName} onChange={e => setMName(e.target.value)} placeholder="e.g. Paracetamol" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/40">{t.dosage}</label>
                        <input value={mDosage} onChange={e => setMDosage(e.target.value)} placeholder="e.g. 500mg" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/40">{t.instruction}</label>
                        <input value={mInstr} onChange={e => setMInstr(e.target.value)} placeholder="e.g. After Lunch" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/40">{t.note}</label>
                        <input value={mNote} onChange={e => setMNote(e.target.value)} placeholder="e.g. Avoid direct sunlight" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/40">Timing</label>
                        <div className="flex gap-2">
                          {(['morning', 'afternoon', 'evening'] as const).map(time => (
                            <button 
                              key={time} 
                              onClick={() => setMSchedule(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                              className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg ${mSchedule.includes(time) ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-white/5 text-white/40'}`}
                            >
                              {time[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <button onClick={handleAddMedicine} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-2xl shadow-blue-600/40 text-lg">
                     {t.saveMed}
                   </button>
                 </div>
               )}

               <div className="flex flex-col xl:flex-row gap-8 pb-16">
                  <MedicineColumn title={t.morning} time="morning" medicines={selectedPatient.medicines} t={t} onSpeak={(m) => onSpeak(`Reminder for ${m.name}, dosage ${m.dosage}. Instruction: ${m.instruction}. ${m.note ? 'Note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
                  <MedicineColumn title={t.afternoon} time="afternoon" medicines={selectedPatient.medicines} t={t} onSpeak={(m) => onSpeak(`Reminder for ${m.name}, dosage ${m.dosage}. Instruction: ${m.instruction}. ${m.note ? 'Note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
                  <MedicineColumn title={t.evening} time="evening" medicines={selectedPatient.medicines} t={t} onSpeak={(m) => onSpeak(`Reminder for ${m.name}, dosage ${m.dosage}. Instruction: ${m.instruction}. ${m.note ? 'Note: ' + m.note : ''}`)} isPlayingAudio={isPlayingAudio} />
               </div>
            </div>
          ) : (
            <>
              <section className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl max-w-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={120} /></div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    {role === 'nurse' ? <Stethoscope className="text-blue-400" size={28} /> : <Plus className="text-blue-400" size={28} />}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">{role === 'nurse' ? t.addPatient : t.addRelative}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">{t.relName}</label>
                    <input value={newPersonName} onChange={e => setNewPersonName(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 outline-none font-medium" placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">{t.relPhone}</label>
                    <input value={newPersonPhone} onChange={e => setNewPersonPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-blue-500/50 outline-none font-medium" placeholder="Phone" />
                  </div>
                </div>
                <button onClick={handleAddPerson} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group text-lg shadow-2xl shadow-blue-600/30">
                   {t.addBtn} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center"><Users className="text-blue-400" /></div>
                  <h2 className="text-3xl font-bold tracking-tight">{t.managedPatients}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {managedPatients.map((p: any, i: number) => (
                    <div key={i} onClick={() => setSelectedPatientIdx(i)} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:border-blue-500/50 transition-all group cursor-pointer shadow-lg hover:shadow-blue-500/10">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="text-white/60 group-hover:text-blue-400 transition-colors" size={32} />
                        </div>
                        <div>
                          <h3 className="font-black text-2xl tracking-tighter">{p.name}</h3>
                          <div className="flex items-center gap-2 text-white/40 text-sm font-medium mt-1"><Phone size={14} /> +91 {p.phone}</div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{p.medicines.length} Active Meds</span>
                         <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                           {t.viewMeds} <ChevronRight size={18} />
                         </div>
                      </div>
                    </div>
                  ))}
                  {managedPatients.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center gap-5">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><Users className="text-white/10" size={40} /></div>
                      <p className="text-white/20 font-bold uppercase tracking-[0.2em] text-sm">Registry Empty</p>
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
  const [scanMessage, setScanMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isCallAnswered, setIsCallAnswered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = TRANSLATIONS[lang];
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
  };

  const showScanMessage = (text: string, type: 'success' | 'error') => {
    setScanMessage({ text, type });
    setTimeout(() => setScanMessage(null), 8000);
  };

  const handleSpeak = async (text: string) => {
    initAudio();
    setIsPlayingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: `You are a helpful caregiver. Say this naturally in ${lang} with a warm tone: ${text}` }] },
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
      } else {
        setIsPlayingAudio(false);
      }
    } catch (e: any) { 
      console.error("TTS Error:", e);
      setIsPlayingAudio(false); 
      showScanMessage(e?.message || "Voice assistance failed.", "error");
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fullBase64 = ev.target?.result as string;
      const base64Data = fullBase64.split(',')[1];
      const mimeType = file.type || 'image/jpeg';

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: "CRITICAL: You are an expert medical OCR assistant. Extract ALL medicine details from this prescription. Even if text is blurry, use context to infer the correct drug. For each medicine, extract: name, dosage (e.g., 500mg), frequency, schedule (list 'morning', 'afternoon', 'evening' as applicable), detailed instruction, and any note/warning. Return ONLY a JSON object." }
            ]
          },
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
                      instruction: { type: Type.STRING },
                      note: { type: Type.STRING }
                    },
                    required: ["name", "dosage", "frequency", "schedule", "instruction"]
                  }
                }
              },
              required: ["medicines"]
            }
          }
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Empty response from AI engine.");
        
        const data = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());

        if (data && Array.isArray(data.medicines)) {
          const normalizedMeds = data.medicines.map((m: any) => ({
            ...m,
            schedule: m.schedule.map((s: string) => s.toLowerCase().trim()).filter((s: string) => ['morning', 'afternoon', 'evening'].includes(s))
          }));
          setMedicines(normalizedMeds);
          showScanMessage(t.scanSuccess, 'success');
        } else {
          throw new Error("Medicine data structure missing in AI response.");
        }
      } catch (err: any) { 
        console.error("Scan error:", err);
        // Display full error for Vercel debugging
        showScanMessage(err?.message || t.scanError, 'error');
      } finally { 
        setIsScanning(false); 
      }
    };
    reader.onerror = () => {
      setIsScanning(false);
      showScanMessage(t.scanError, 'error');
    };
    reader.readAsDataURL(file);
  };

  const answerCall = async () => {
    setIsCallAnswered(true);
    const medList = medicines.map(m => m.name).join(', ');
    const msg = medicines.length > 0 ? `Hello ${userData.name}, I am your MedRush assistant. Don't forget to take: ${medList}. Please check your instructions.` : `Hello ${userData.name}, MedRush reminder service.`;
    await handleSpeak(msg);
    setTimeout(() => { setIsCalling(false); setIsCallAnswered(false); }, 15000);
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
          scanMessage={scanMessage}
          onLogout={() => { setScreen('splash'); setRole(null); setUserData({ name: '', phone: '', disease: '' }); }}
          onScan={handleScan}
          onStartCall={() => setIsCalling(true)}
          onSpeak={handleSpeak}
          isPlayingAudio={isPlayingAudio}
        />
      )}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-[#0a0b1e] flex flex-col items-center justify-between p-12 text-white animate-in zoom-in duration-500 backdrop-blur-3xl">
           <div className="flex flex-col items-center mt-20">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_80px_rgba(37,99,235,0.4)] border-4 border-white/20">
                <HeartPulse size={64} />
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter mb-2">MedRush</h2>
              <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs">{t.callIncoming}</p>
           </div>
           <div className="flex gap-16 mb-24">
              {!isCallAnswered ? (
                <>
                  <button onClick={() => setIsCalling(false)} className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform border-4 border-white/10"><X size={40} /></button>
                  <button onClick={answerCall} className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce active:scale-90 transition-transform border-4 border-white/10"><Phone size={40} /></button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-3 h-14 items-end">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-2.5 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: `${i * 0.12}s` }} />)}
                  </div>
                  <button onClick={() => setIsCalling(false)} className="mt-12 bg-white/5 border border-white/10 hover:bg-white/10 px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all">End Session</button>
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
