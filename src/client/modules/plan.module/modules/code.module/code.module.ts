import { controller } from "./code.controller";
import { CodeService } from "./code.service";

export const moduleConfig = {
  services: [CodeService],
  controllers: [controller],
};
