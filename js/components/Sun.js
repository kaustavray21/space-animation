export class Sun {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width * 3 - this.canvas.width * 1.5;
    this.y = Math.random() * this.canvas.height * 3 - this.canvas.height * 1.5;
    this.z = Math.random() * this.canvas.width + this.canvas.width * 3;

    const sunTypes = [
      // Blue: O-type stars
      {
        core: "rgba(200, 220, 255, 1)",
        corona1: "rgba(100, 180, 255, 0.25)",
        corona2: "rgba(50, 100, 255, 0.15)",
        flare: "rgba(170, 210, 255, 0.5)",
      },
      // White: A-type stars
      {
        core: "rgba(255, 255, 255, 1)",
        corona1: "rgba(220, 230, 255, 0.25)",
        corona2: "rgba(200, 210, 255, 0.15)",
        flare: "rgba(240, 240, 255, 0.5)",
      },
      // Yellow: G-type stars
      {
        core: "rgba(255, 255, 220, 1)",
        corona1: "rgba(255, 204, 0, 0.2)",
        corona2: "rgba(255, 100, 0, 0.1)",
        flare: "rgba(255, 204, 0, 0.5)",
      },
      // Orange: K-type stars
      {
        core: "rgba(255, 200, 180, 1)",
        corona1: "rgba(255, 150, 50, 0.2)",
        corona2: "rgba(255, 100, 0, 0.1)",
        flare: "rgba(255, 150, 50, 0.5)",
      },
      // Red: M-type stars
      {
        core: "rgba(255, 180, 150, 1)",
        corona1: "rgba(255, 100, 50, 0.2)",
        corona2: "rgba(220, 20, 0, 0.1)",
        flare: "rgba(255, 100, 50, 0.5)",
      },
    ];
    this.colors = sunTypes[Math.floor(Math.random() * sunTypes.length)];
    this.size = 0.7 + Math.random() * 0.6;
    this.flareAnimation = Math.random() * 100;

    // Lifecycle properties
    this.willExplode = Math.random() > 0.5; // 50% chance the sun will go supernova
    this.lifetime = 15000 + Math.random() * 10000; // Lifetime in milliseconds
    this.state = "stable"; // 'stable' or 'supernova'

    this.flares = [];
    const numFlares = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numFlares; i++) {
      this.flares.push({
        angle: Math.random() * Math.PI * 2,
        length: 0.5 + Math.random() * 1.5,
        speed: 0.1 + Math.random() * 0.2,
      });
    }
  }

  update(deltaTime, speed) {
    this.z -= speed * 0.1 * deltaTime;
    this.flareAnimation += deltaTime * 0.05;
    this.lifetime -= deltaTime;

    // Check if the sun should go supernova
    if (this.willExplode && this.lifetime <= 0 && this.state === "stable") {
      this.state = "supernova";
      return {
        action: "createNebula",
        x: this.x,
        y: this.y,
        z: this.z,
      };
    }

    // If a sun flies past the camera, reset it completely.
    if (this.z < 1 && this.state !== "supernova") {
      this.reset();
    }

    return null;
  }

  show(ctx) {
    // BUG FIX: Prevent drawing when z is behind the camera to avoid infinite coordinates.
    if (this.state === "supernova" || this.z < 1) {
      // Don't draw the sun anymore once it has gone supernova or is behind the camera
      return;
    }

    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;
    const r =
      Math.max(20, ((this.canvas.width - this.z) / this.canvas.width) * 80) *
      this.size;

    // --- Draw Corona ---
    const coronaGradient1 = ctx.createRadialGradient(sx, sy, r, sx, sy, r * 3);
    coronaGradient1.addColorStop(0, this.colors.corona2);
    coronaGradient1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = coronaGradient1;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
    ctx.fill();

    const coronaGradient2 = ctx.createRadialGradient(
      sx,
      sy,
      r,
      sx,
      sy,
      r * 1.5
    );
    coronaGradient2.addColorStop(0, this.colors.corona1);
    coronaGradient2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = coronaGradient2;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // --- Draw Core ---
    const coreGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    coreGradient.addColorStop(0, "white");
    coreGradient.addColorStop(0.1, this.colors.core);
    coreGradient.addColorStop(1, this.colors.corona1);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // --- Draw Solar Flares ---
    if (r > 50) {
      for (const flare of this.flares) {
        const angle = flare.angle + this.flareAnimation * flare.speed;
        const length =
          r *
          flare.length *
          (0.8 + Math.sin(this.flareAnimation * flare.speed) * 0.2);

        const startX = sx + Math.cos(angle) * r;
        const startY = sy + Math.sin(angle) * r;
        const endX = sx + Math.cos(angle) * (r + length);
        const endY = sy + Math.sin(angle) * (r + length);

        const flareGradient = ctx.createLinearGradient(
          startX,
          startY,
          endX,
          endY
        );
        flareGradient.addColorStop(0, this.colors.flare);
        flareGradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // --- Draw Lens Flare ---
    if (r > 60) {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const vecX = centerX - sx;
      const vecY = centerY - sy;
      const dist = Math.sqrt(vecX * vecX + vecY * vecY);

      const numGhosts = 4;
      const ghostColors = [
        "rgba(100, 255, 100, 0.1)",
        "rgba(100, 100, 255, 0.1)",
        "rgba(255, 100, 100, 0.1)",
      ];

      for (let i = 1; i <= numGhosts; i++) {
        const ghostDist = i * dist * 0.4;
        const ghostX = sx - vecX * (ghostDist / dist);
        const ghostY = sy - vecY * (ghostDist / dist);
        const ghostSize = r * (0.4 - i * 0.08);

        if (ghostSize > 0) {
          ctx.fillStyle = ghostColors[i % ghostColors.length];
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, ghostSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const glareGradient = ctx.createRadialGradient(sx, sy, r, sx, sy, r * 4);
      glareGradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      glareGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glareGradient;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
