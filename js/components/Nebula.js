export class Nebula {
  constructor(canvas) {
    this.canvas = canvas;
    // Initialize position in 3D space, far from the viewer
    this.x = Math.random() * this.canvas.width * 4 - this.canvas.width * 2;
    this.y = Math.random() * this.canvas.height * 4 - this.canvas.height * 2;
    this.z = Math.random() * this.canvas.width * 2 + this.canvas.width * 5;
    this.particles = [];
    this.explosions = [];

    // Define nebula color using HSL for vibrant, translucent effect
    const hue = Math.random() * 360;
    const mainColor = `hsla(${hue}, 100%, 50%, 0.05)`;
    const explosionColor = `hsla(${hue}, 100%, 70%, 0.8)`;

    // Define sun color schemes for when the nebula transitions to a sun
    const sunTypes = [
      {
        core: "rgba(200, 220, 255, 1)", // Blue O-type star
        corona1: "rgba(100, 180, 255, 0.25)",
        corona2: "rgba(50, 100, 255, 0.15)",
        flare: "rgba(170, 210, 255, 0.5)",
      },
      {
        core: "rgba(255, 255, 255, 1)", // White A-type star
        corona1: "rgba(220, 230, 255, 0.25)",
        corona2: "rgba(200, 210, 255, 0.15)",
        flare: "rgba(240, 240, 255, 0.5)",
      },
      {
        core: "rgba(255, 255, 220, 1)", // Yellow G-type star
        corona1: "rgba(255, 204, 0, 0.2)",
        corona2: "rgba(255, 100, 0, 0.1)",
        flare: "rgba(255, 204, 0, 0.5)",
      },
      {
        core: "rgba(255, 200, 180, 1)", // Orange K-type star
        corona1: "rgba(255, 150, 50, 0.2)",
        corona2: "rgba(255, 100, 0, 0.1)",
        flare: "rgba(255, 150, 50, 0.5)",
      },
      {
        core: "rgba(255, 180, 150, 1)", // Red M-type star
        corona1: "rgba(255, 100, 50, 0.2)",
        corona2: "rgba(220, 20, 0, 0.1)",
        flare: "rgba(255, 100, 50, 0.5)",
      },
    ];

    // Assign sun type based on nebula hue
    if (hue >= 191 && hue <= 280) {
      this.sunToCreate = sunTypes[0]; // Blue
    } else if (hue >= 76 && hue <= 190) {
      this.sunToCreate = sunTypes[1]; // White
    } else if (hue >= 66 && hue <= 75) {
      this.sunToCreate = sunTypes[2]; // Yellow
    } else if (hue >= 41 && hue <= 65) {
      this.sunToCreate = sunTypes[3]; // Orange
    } else {
      this.sunToCreate = sunTypes[4]; // Red
    }

    // Initialize lifecycle properties
    this.explosionsTriggered = 0;
    this.maxExplosions = 5 + Math.floor(Math.random() * 5); // 5–9 explosions
    this.state = "gaseous";

    // Create 150 particles for the nebula cloud
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.random() * this.canvas.width * 1.5;
      this.particles.push({
        xOffset: Math.cos(angle) * radius,
        yOffset: Math.sin(angle) * radius,
        radius: Math.random() * 200 + 150,
        color: mainColor,
      });
    }

    // Create 5 explosions for dynamic visual effects
    for (let i = 0; i < 5; i++) {
      this.explosions.push({
        xOffset: (Math.random() - 0.5) * this.canvas.width,
        yOffset: (Math.random() - 0.5) * this.canvas.height,
        lifetime: Math.random() * 3000,
        maxLifetime: 2000 + Math.random() * 2000, // 2000–4000 ms
        color: explosionColor,
      });
    }
  }

  update(deltaTime, speed) {
    // Move nebula toward the viewer
    this.z -= speed * 0.05 * deltaTime;

    if (this.state === "gaseous") {
      // Update explosion lifetimes and count triggers
      this.explosions.forEach((exp) => {
        exp.lifetime -= deltaTime;
        if (exp.lifetime <= 0) {
          exp.lifetime = exp.maxLifetime;
          this.explosionsTriggered++;
        }
      });

      // Transition to igniting state and signal sun creation
      if (this.explosionsTriggered >= this.maxExplosions) {
        this.state = "igniting";
        return {
          action: "createSun",
          x: this.x,
          y: this.y,
          z: this.z,
          colors: this.sunToCreate, // Correctly returns colors object for engine.js
        };
      }
    }

    // Reset position if nebula moves past the viewer (and not igniting)
    if (this.z < 1 && this.state !== "igniting") {
      this.z = Math.random() * this.canvas.width * 2 + this.canvas.width * 5;
      this.x = Math.random() * this.canvas.width * 4 - this.canvas.width * 2;
      this.y = Math.random() * this.canvas.height * 4 - this.canvas.height * 2;
    }

    return null;
  }

  show(ctx) {
    if (this.state === "igniting") {
      return; // Skip rendering when igniting (handled by engine.js creating a sun)
    }

    // Calculate screen coordinates
    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;

    // Draw nebula particles
    this.particles.forEach((p) => {
      const particleX = sx + ((p.xOffset / this.z) * this.canvas.width) / 2;
      const particleY = sy + ((p.yOffset / this.z) * this.canvas.height) / 2;
      const r = ((p.radius / this.z) * this.canvas.width) / 2;
      if (r > 1) {
        const gradient = ctx.createRadialGradient(
          particleX,
          particleY,
          0,
          particleX,
          particleY,
          r
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particleX, particleY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw explosions when nebula is large enough
    const nebulaScale = ((this.canvas.width / this.z) * this.canvas.width) / 2;
    if (nebulaScale > 50) {
      this.explosions.forEach((exp) => {
        const progress = 1 - exp.lifetime / exp.maxLifetime;
        const pulse = Math.sin(progress * Math.PI);

        const expX = sx + ((exp.xOffset / this.z) * this.canvas.width) / 2;
        const expY = sy + ((exp.yOffset / this.z) * this.canvas.height) / 2;
        const r = (((100 / this.z) * this.canvas.width) / 2) * pulse;

        if (r > 1) {
          const gradient = ctx.createRadialGradient(
            expX,
            expY,
            0,
            expX,
            expY,
            r
          );
          const color = exp.color.replace(/, [0-9.]+\)/, `, ${pulse * 0.5})`);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(expX, expY, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }
}
