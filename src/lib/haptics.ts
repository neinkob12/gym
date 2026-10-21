// Kurzes Vibrieren bei Aktionen. In der iOS-App echt, im Browser ohne Wirkung.

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export function tapFeedback(strong = false) {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: strong ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
}
