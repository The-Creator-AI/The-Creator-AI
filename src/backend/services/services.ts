import { ReflectiveInjector } from "injection-js";
import "reflect-metadata";
import { CreatorService } from "./creator.service";
import { LlmService } from "./llm.service";
import { SettingsRepository } from "../repositories/settings.repository";
import { ChatRepository } from "../repositories/chat.respository";
import { PersistentStoreRepository } from "../repositories/persistent-store.repository";
import { ChangePlanExportService } from "./change-plan-export.service";
import { ChangePlanImportService } from "./change-plan-import.service";
import { LoggerService } from "./logger.service";

export class Services {
  static injector: ReflectiveInjector;

  static async initialize(): Promise<void> {
    Services.injector = ReflectiveInjector.resolveAndCreate([
      ChatRepository,
      SettingsRepository,
      PersistentStoreRepository,
      CreatorService,
      LlmService,
      ChangePlanExportService,
      ChangePlanImportService,
      LoggerService,
    ]);
  }

  static getCreatorService(): CreatorService {
    return Services.injector.get(CreatorService);
  }

  static getLlmService(): LlmService {
    return Services.injector.get(LlmService);
  }

  static getPersistentStoreRepository(): PersistentStoreRepository {
    return Services.injector.get(PersistentStoreRepository);
  }

  static getSettingsRepository(): SettingsRepository {
    return Services.injector.get(SettingsRepository);
  }

  static getChangePlanExportService(): ChangePlanExportService {
    return Services.injector.get(ChangePlanExportService);
  }

  static getChangePlanImportService(): ChangePlanImportService {
    return Services.injector.get(ChangePlanImportService);
  }

  static getLoggerService(): LoggerService {
    return Services.injector.get(LoggerService);
  }
}
