import { analytics } from "@/common/firebase";
import { getAnalytics, logEvent } from "firebase/analytics";

// Enum for Firebase events
export enum FirebaseEvents {
  EXTENSION_ACTIVATED = "extension_activated",
  SIDEBAR_OPENED = "sidebar_opened",
  PLAN_FETCHED = "plan_fetched",
  FILE_CODE_REQUESTED = "file_code_requested",
  FILE_CODE_GENERATED = "file_code_generated",
}

// Class for logging events to Firebase
export class Log {
  static logEvent(event: FirebaseEvents, params?: Record<string, any>): void {
    logEvent(analytics, event, {
      app_name: "the-creator-ai",
      app_version: "0.1.1",
      ...params,
    });
  }

  static extensionActivated(): void {
    this.logEvent(FirebaseEvents.EXTENSION_ACTIVATED);
  }

  static sidebarOpened(): void {
    this.logEvent(FirebaseEvents.SIDEBAR_OPENED);
  }

  static planFetched(): void {
    this.logEvent(FirebaseEvents.PLAN_FETCHED);
  }

  static fileCodeRequested(): void {
    this.logEvent(FirebaseEvents.FILE_CODE_REQUESTED);
  }

  static fileCodeGenerated(): void {
    this.logEvent(FirebaseEvents.FILE_CODE_GENERATED);
  }
}
