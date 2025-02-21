import { moduleConfig as codeModuleConfig } from "./modules/code.module/code.module";
import { controller } from "./plan.controller";

export const moduleConfig = {
  services: [...codeModuleConfig.services],
  controllers: [
    controller,
    ...codeModuleConfig.controllers
  ],
};
