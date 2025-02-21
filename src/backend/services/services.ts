import { ReflectiveInjector } from "injection-js";
import "reflect-metadata";
import { FSService } from "./fs.service";
import { LlmService } from "./llm.service";
import { SettingsRepository } from "../repositories/settings.repository";
import { ChatRepository } from "../repositories/chat.respository";
import { PersistentStoreRepository } from "../repositories/persistent-store.repository";
import { LoggerService } from "./logger.service";
import { PlanExImService } from "./plan-exim.service";
import { GitService } from "./git.service";
import { MessageService } from "./message.service";
import { moduleConfig } from "@/client/modules/plan.module/plan.module";

export class Services {
  static injector: ReflectiveInjector;

  static async initialize(): Promise<void> {
    Services.injector = ReflectiveInjector.resolveAndCreate([
      ChatRepository,
      SettingsRepository,
      PersistentStoreRepository,
      FSService,
      LlmService,
      PlanExImService,
      LoggerService,
      GitService,
      MessageService,
      ...moduleConfig.services,
    ]);
  }

  static getService<T>(service: { new (): T }): T {
    return Services.injector.get(service);
  }

  static getFSService(): FSService {
    return Services.injector.get(FSService);
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

  static getLoggerService(): LoggerService {
    return Services.injector.get(LoggerService);
  }

  static getGitService(): GitService {
    return Services.injector.get(GitService);
  }

  static getMessageService(): MessageService {
    return Services.injector.get(MessageService);
  }
}
