import { ReflectiveInjector } from "injection-js";
import "reflect-metadata";
import { FSService } from "./fs.service";
import { LlmService } from "./llm.service";
import { SettingsRepository } from "../repositories/settings.repository";
import { ChatRepository } from "../repositories/chat.respository";
import { PersistentStoreRepository } from "../repositories/persistent-store.repository";
import { LoggerService } from "./logger.service";
import { PlanExImService } from "./plan-exim.service";
import { CodeService } from "./code.service";
import { GitService } from "./git.service";
import { MessageService } from "./message.service";

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
      CodeService,
      GitService,
      MessageService,
    ]);
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

   static getCodeService(): CodeService {
    return Services.injector.get(CodeService);
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