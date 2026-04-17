interface Step {
  number: number;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Data Tim", icon: "groups" },
  { number: 2, label: "Kelas / Pit", icon: "garage" },
  { number: 3, label: "Pembalap", icon: "person" },
  { number: 4, label: "Kendaraan", icon: "directions_car" },
  { number: 5, label: "Review", icon: "checklist" },
];

interface StepperHeaderProps {
  currentStep: number; // 1–5
  lockedUntil?: number; // steps before this number are locked/readonly
}

export default function StepperHeader({ currentStep, lockedUntil = 1 }: StepperHeaderProps) {
  return (
    <div className="relative mb-10">
      {/* Connector line */}
      <div className="absolute top-5 left-0 right-0 h-px bg-white/8 mx-10 hidden sm:block" />

      <div className="flex items-start justify-between gap-1 sm:gap-2 relative z-10">
        {STEPS.map((step, idx) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isLocked = step.number < lockedUntil;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2 flex-1">
              {/* Circle */}
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isDone
                    ? "bg-green-500/20 border-green-500/50"
                    : isActive
                    ? "bg-[#b80014] border-[#b80014] shadow-lg shadow-[#b80014]/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-green-400 text-[18px]">
                    check_circle
                  </span>
                ) : (
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isActive ? "text-white" : "text-white/25"
                    }`}
                  >
                    {step.icon}
                  </span>
                )}

                {/* Lock indicator */}
                {isLocked && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-white/30 text-[9px]">lock</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <p
                className={`text-[10px] sm:text-xs font-medium text-center leading-tight transition-colors ${
                  isActive
                    ? "text-white"
                    : isDone
                    ? "text-green-400/70"
                    : "text-white/25"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
