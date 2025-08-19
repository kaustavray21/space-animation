import { Star } from "./components/Star.js";
import { Asteroid } from "./components/Asteroid.js";
import { Planet } from "./components/Planet.js";
import { Sun } from "./components/Sun.js";
import { SpaceDust } from "./components/SpaceDust.js";
import { Spaceship } from "./components/Spaceship.js";
import { Nebula } from "./components/Nebula.js";
import { Comet } from "./components/Comet.js";

export class SpaceAnimation {
  constructor(canvasId, config) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.config = config;
    this.speed = this.config.baseSpeed;
    this.lastTime = 0;
    this.elements = {
      stars: [],
      asteroids: [],
      planets: [],
      suns: [],
      spaceDust: [],
      spaceships: [],
      nebulae: [],
      comets: [],
    };
    this.init();
  }

  init() {
    this.setCanvasSize();
    this.populateElements();
    this.setupEventListeners();
    this.animate(0);
  }

  setCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  populateElements() {
    this.elements.stars = [];
    this.elements.asteroids = [];
    this.elements.planets = [];
    this.elements.suns = [];
    this.elements.spaceDust = [];
    this.elements.spaceships = [];
    this.elements.nebulae = [];
    this.elements.comets = [];

    for (let i = 0; i < this.config.numStars; i++)
      this.elements.stars.push(new Star(this.canvas));
    for (let i = 0; i < this.config.numAsteroids; i++)
      this.elements.asteroids.push(new Asteroid(this.canvas));
    for (let i = 0; i < this.config.numPlanets; i++)
      this.elements.planets.push(new Planet(this.canvas));
    for (let i = 0; i < this.config.numSuns; i++)
      this.elements.suns.push(new Sun(this.canvas));
    for (let i = 0; i < this.config.numSpaceDust; i++)
      this.elements.spaceDust.push(new SpaceDust(this.canvas));
    for (let i = 0; i < this.config.numSpaceships; i++)
      this.elements.spaceships.push(new Spaceship(this.canvas));
    for (let i = 0; i < this.config.numNebulae; i++)
      this.elements.nebulae.push(new Nebula(this.canvas));
    for (let i = 0; i < this.config.numComets; i++)
      this.elements.comets.push(new Comet(this.canvas));
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") this.speed = this.config.boostSpeed;
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") this.speed = this.config.baseSpeed;
    });
    window.addEventListener("resize", () => {
      this.setCanvasSize();
      this.populateElements();
    });
  }

  animate(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const allObjects = Object.values(this.elements)
      .flat()
      .sort((a, b) => b.z - a.z);

    const sunsToAdd = [];
    const nebulaeToRemove = [];
    const nebulaeToAdd = [];
    const sunsToRemove = [];

    allObjects.forEach((obj) => {
      const updateResult = obj.update(deltaTime, this.speed);

      // Check if a nebula has triggered the creation of a sun
      if (
        obj instanceof Nebula &&
        updateResult &&
        updateResult.action === "createSun"
      ) {
        const newSun = new Sun(this.canvas);
        newSun.x = updateResult.x;
        newSun.y = updateResult.y;
        newSun.z = updateResult.z;
        newSun.colors = updateResult.colors; // Fixed: Use 'colors' instead of 'color'

        sunsToAdd.push(newSun);
        nebulaeToRemove.push(obj);
      }

      // Check if a sun has gone supernova to create a nebula
      if (
        obj instanceof Sun &&
        updateResult &&
        updateResult.action === "createNebula"
      ) {
        const newNebula = new Nebula(this.canvas);
        newNebula.x = updateResult.x;
        newNebula.y = updateResult.y;
        newNebula.z = updateResult.z;

        nebulaeToAdd.push(newNebula);
        sunsToRemove.push(obj);
      }

      if (obj instanceof Spaceship) {
        obj.show(this.ctx, this.speed, this.config.baseSpeed);
      } else {
        obj.show(this.ctx);
      }
    });

    // Add new suns and remove the old nebulae
    if (sunsToAdd.length > 0) {
      this.elements.suns.push(...sunsToAdd);
    }
    if (nebulaeToRemove.length > 0) {
      this.elements.nebulae = this.elements.nebulae.filter(
        (n) => !nebulaeToRemove.includes(n)
      );
    }

    // Add new nebulae and remove the old suns
    if (nebulaeToAdd.length > 0) {
      this.elements.nebulae.push(...nebulaeToAdd);
    }
    if (sunsToRemove.length > 0) {
      this.elements.suns = this.elements.suns.filter(
        (s) => !sunsToRemove.includes(s)
      );
    }

    requestAnimationFrame(this.animate.bind(this));
  }
}
