"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMyTeam } from "@/lib/api/teams";
import StepperHeader from "./components/StepperHeader";
import Step1Team from "./components/Step1Team";
import Step2Pit from "./components/Step2Pit";
import Step3Racers from "./components/Step3Racers";
import Step4Vehicles from "./components/Step4Vehicles";
import Step5Review from "./components/Step5Review";

function OrderBoardingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const pitIdFromQuery = params.get("pitId");

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Data per step
  const [existingTeam, setExistingTeam] = useState<any | null>(null);
  const [selectedPit, setSelectedPit] = useState<any | null>(null);
  const [selectedRacer, setSelectedRacer] = useState<any | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // If user already has a team and there's a pitId in query → skip to step 2
  const isExistingUser = !!existingTeam;
  const lockedUntil = isExistingUser ? 3 : 1; // Steps 1 & 2 locked for existing users with pre-selected pit

  useEffect(() => {
    const init = async () => {
      const team = await getMyTeam().catch(() => null);
      setExistingTeam(team);

      if (team && pitIdFromQuery) {
        // Existing user coming from katalog-pit → skip to step 3 (team & pit auto-set)
        setCurrentStep(3);
      } else if (team) {
        // Existing user, no pit pre-selected → start at step 2
        setCurrentStep(2);
      } else {
        // Brand new user → start at step 1
        setCurrentStep(1);
      }
      setLoading(false);
    };
    init();
  }, [pitIdFromQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-bold text-white">Daftar Kelas Balap</h1>
        <p className="text-white/40 text-sm mt-1">
          Ikuti langkah-langkah berikut untuk mendaftarkan tim Anda ke event.
        </p>
      </div>

      {/* Stepper */}
      <StepperHeader currentStep={currentStep} lockedUntil={lockedUntil} />

      {/* Step Content */}
      <div className="min-h-[300px]">
        {/* Step 1: Data Tim */}
        {currentStep === 1 && (
          <Step1Team
            existingTeam={existingTeam}
            readonly={isExistingUser}
            onNext={(team) => {
              setExistingTeam(team);
              setCurrentStep(2);
            }}
          />
        )}

        {/* Step 2: Pilih Pit */}
        {currentStep === 2 && (
          <Step2Pit
            preSelectedPitId={pitIdFromQuery}
            locked={isExistingUser && !!pitIdFromQuery}
            onNext={(pit) => {
              setSelectedPit(pit);
              setCurrentStep(3);
            }}
            onBack={() => {
              if (!isExistingUser) setCurrentStep(1);
            }}
          />
        )}

        {/* Step 3: Pilih Pembalap */}
        {currentStep === 3 && existingTeam && (
          <Step3Racers
            teamId={existingTeam.id}
            onNext={(racer) => {
              setSelectedRacer(racer);
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* Step 4: Pilih Kendaraan */}
        {currentStep === 4 && existingTeam && (
          <Step4Vehicles
            teamId={existingTeam.id}
            onNext={(vehicle) => {
              setSelectedVehicle(vehicle);
              setCurrentStep(5);
            }}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && existingTeam && selectedPit && selectedRacer && selectedVehicle && (
          <Step5Review
            team={existingTeam}
            pit={selectedPit}
            racer={selectedRacer}
            vehicle={selectedVehicle}
            onBack={() => setCurrentStep(4)}
            onSuccess={(orderId) => {
              router.push(`/dashboard/team/orders/${orderId}/payment`);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function OrderBoardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <OrderBoardingContent />
    </Suspense>
  );
}
