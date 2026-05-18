import React from "react";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

const TASKS = [
  {
    id: "description",
    label: "Aggiungi una descrizione",
    desc: "Presenta la tua palestra agli utenti",
    check: (gym) => !!gym.description?.trim(),
    tab: "info",
  },
  {
    id: "photos",
    label: "Carica almeno una foto",
    desc: "Le foto aumentano le prenotazioni",
    check: (gym) => gym.photos?.length > 0,
    tab: "photos",
  },
  {
    id: "opening_hours",
    label: "Imposta gli orari di apertura",
    desc: "Gli utenti vogliono sapere quando vieni aperto",
    check: (gym) => !!gym.opening_hours && Object.keys(gym.opening_hours).length > 0,
    tab: "info",
  },
  {
    id: "visura",
    label: "Carica la visura camerale",
    desc: "Necessaria per la verifica e attivazione",
    check: (gym) => !!gym.visura_url,
    tab: "documents",
  },
  {
    id: "stripe",
    label: "Collega Stripe per i pagamenti",
    desc: "Necessario per ricevere i pagamenti mensili",
    check: (gym) => !!gym.stripe_onboarding_complete,
    tab: "documents",
  },
];

export default function OnboardingChecklist({ gym, onTabChange }) {
  const pending = TASKS.filter(t => !t.check(gym));
  const done = TASKS.filter(t => t.check(gym));

  if (pending.length === 0) return null;

  const progress = Math.round((done.length / TASKS.length) * 100);

  return (
    <div className="bg-[#0a0a0a] border border-[#E8FF00]/20 rounded-2xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-sm">Completa il tuo profilo</h3>
          <p className="text-gray-500 text-xs mt-0.5">{done.length}/{TASKS.length} completati</p>
        </div>
        <div className="text-right">
          <span className="text-[#E8FF00] font-black text-2xl">{progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#E8FF00] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {pending.map(task => (
          <button
            key={task.id}
            onClick={() => onTabChange(task.tab)}
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-4 py-3 transition-all group text-left"
          >
            <Circle className="w-4 h-4 text-gray-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{task.label}</p>
              <p className="text-gray-500 text-xs">{task.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#E8FF00] transition-colors shrink-0" />
          </button>
        ))}
        {done.map(task => (
          <div key={task.id} className="flex items-center gap-3 px-4 py-2 opacity-50">
            <CheckCircle className="w-4 h-4 text-[#E8FF00] shrink-0" />
            <p className="text-gray-400 text-sm line-through">{task.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}