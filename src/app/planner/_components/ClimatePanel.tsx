"use client";

import Modal, { ModalHeader } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import CityClimateReport from "@/features/weather/components/CityClimateReport";
import { rateCityMonths } from "@/features/weather/lib/bestTime";

type Props = {
  cityId: string;
  cityName: string;
  onClose: () => void;
  /** Jump to the Stays tab for this city. */
  onFindStays: (cityId: string) => void;
};

/** In-hub "best time to visit" report for a city on the itinerary. */
export default function ClimatePanel({ cityId, cityName, onClose, onFindStays }: Props) {
  const report = rateCityMonths(cityId);

  return (
    <Modal onClose={onClose} ariaLabel={`Best time to visit ${cityName}`} size="lg">
      <ModalHeader title="Best time to visit" onClose={onClose} />
      {report ? (
        <CityClimateReport
          report={report}
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                onFindStays(cityId);
                onClose();
              }}
            >
              Find stays in {cityName}
            </Button>
          }
        />
      ) : (
        <p className="text-small text-[var(--muted)] py-6">
          Climate data isn&apos;t available for {cityName} yet.
        </p>
      )}
    </Modal>
  );
}
