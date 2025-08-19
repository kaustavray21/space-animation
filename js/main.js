import { config } from "./config.js";
import { SpaceAnimation } from "./engine.js";

window.onload = () => {
  new SpaceAnimation("starfield", config);
};
