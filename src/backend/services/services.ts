import { ReflectiveInjector } from "injection-js";
import "reflect-metadata";
import { CreatorService } from "./creator.service";
import { LlmService } from "./llm.service";
import { SettingsRepository } from "../repositories/settings.repository";
import { ChatRepository } from "../repositories/chat.respository";
import { PersistentStoreRepository } from "../repositories/persistent-store.repository";
import { LoggerService } from "./logger.service";
import { PlanExImService } from "./plan-exim.service";
import { CodeService } from "./code.service";

export class Services {
  static injector: ReflectiveInjector;

  static async initialize(): Promise<void> {
    Services.injector = ReflectiveInjector.resolveAndCreate([
      ChatRepository,
      SettingsRepository,
      PersistentStoreRepository,
      CreatorService,
      LlmService,
      PlanExImService,
      LoggerService,
      CodeService,
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

  static getPlanExImService(): PlanExImService {
    return Services.injector.get(PlanExImService);
  }

   static getCodeService(): CodeService {
    return Services.injector.get(CodeService);
  }

  static getLoggerService(): LoggerService {
    return Services.injector.get(LoggerService);
  }
}