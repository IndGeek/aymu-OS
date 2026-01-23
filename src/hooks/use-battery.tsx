import { useEffect, useState } from "react";

type BatteryState = {
  batteryLevel: number | null;
  charging: boolean | null;
};

export function useBattery(): BatteryState {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean | null>(null);
  let updateBattery: () => void;

  useEffect(() => {
    if (!("getBattery" in navigator)) return;

    let battery: any;
    // @ts-ignore
    navigator.getBattery().then((b: any) => {
      battery = b;

      updateBattery = () => {
        setBatteryLevel(battery.level * 100);
        setCharging(battery.charging);
      };

      updateBattery();

      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    });

    return () => {
      if (!battery) return;
      battery.removeEventListener("levelchange", updateBattery);
      battery.removeEventListener("chargingchange", updateBattery);
    };
  }, []);

  return { batteryLevel, charging };
}
