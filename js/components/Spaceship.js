export class Spaceship {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
    this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
    this.z = Math.random() * this.canvas.width;
    this.pz = this.z; // Previous z position

    // Randomly assign a design type for variety
    const designTypes = ["streak", "fighter", "ufo"];
    this.design = designTypes[Math.floor(Math.random() * designTypes.length)];

    // Properties for UFO lights
    this.lightAnimation = Math.random() * 10;
  }

  update(deltaTime, speed) {
    this.pz = this.z;
    this.z -= speed * 1.0 * deltaTime;
    this.lightAnimation += deltaTime * 0.01;

    if (this.z < 1) {
      this.z = this.canvas.width;
      this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
      this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
      this.pz = this.z;
      // Re-randomize design when it resets
      const designTypes = ["streak", "fighter", "ufo"];
      this.design = designTypes[Math.floor(Math.random() * designTypes.length)];
    }
  }

  show(ctx, speed, baseSpeed) {
    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;
    const r = Math.max(
      0.1,
      ((this.canvas.width - this.z) / this.canvas.width) * 7
    );

    // Use a switch to draw the correct design
    switch (this.design) {
      case "streak":
        this.drawStreak(ctx, sx, sy, r);
        break;
      case "fighter":
        this.drawFighter(ctx, sx, sy, r);
        break;
      case "ufo":
        this.drawUFO(ctx, sx, sy, r);
        break;
    }
  }

  drawStreak(ctx, sx, sy, r) {
    const psx =
      ((this.x / this.pz) * this.canvas.width) / 2 + this.canvas.width / 2;
    const psy =
      ((this.y / this.pz) * this.canvas.height) / 2 + this.canvas.height / 2;

    const trailGradient = ctx.createLinearGradient(psx, psy, sx, sy);
    trailGradient.addColorStop(0, "rgba(255, 100, 50, 0)");
    trailGradient.addColorStop(1, "rgba(255, 200, 150, 0.75)");

    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = r * 2;
    ctx.beginPath();
    ctx.moveTo(psx, psy);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    const shipGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    shipGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    shipGradient.addColorStop(0.8, "rgba(255, 200, 150, 0.8)");
    shipGradient.addColorStop(1, "rgba(255, 100, 50, 0)");

    ctx.fillStyle = shipGradient;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFighter(ctx, sx, sy, r) {
    if (r < 1) return;
    const bodyGradient = ctx.createLinearGradient(sx - r, sy, sx + r, sy);
    bodyGradient.addColorStop(0, "#808090");
    bodyGradient.addColorStop(0.5, "#e0e0f0");
    bodyGradient.addColorStop(1, "#808090");
    ctx.fillStyle = bodyGradient;

    // Draw fuselage (front-on view)
    ctx.beginPath();
    ctx.moveTo(sx, sy - r * 1.5); // Nose
    ctx.quadraticCurveTo(sx - r, sy, sx - r, sy + r * 2);
    ctx.lineTo(sx + r, sy + r * 2);
    ctx.quadraticCurveTo(sx + r, sy, sx, sy - r * 1.5);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    const engineGradient = ctx.createRadialGradient(
      sx,
      sy + r * 1.5,
      r * 0.2,
      sx,
      sy + r * 1.5,
      r
    );
    engineGradient.addColorStop(0, "rgba(255, 220, 180, 1)");
    engineGradient.addColorStop(1, "rgba(255, 100, 50, 0)");
    ctx.fillStyle = engineGradient;
    ctx.beginPath();
    ctx.arc(sx, sy + r * 1.5, r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawUFO(ctx, sx, sy, r) {
    if (r < 1) return;
    // Main saucer body
    const saucerGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2);
    saucerGradient.addColorStop(0, "#d0d0d8");
    saucerGradient.addColorStop(0.8, "#707080");
    saucerGradient.addColorStop(1, "#404050");
    ctx.fillStyle = saucerGradient;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 2, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit dome
    const domeGradient = ctx.createRadialGradient(
      sx,
      sy - r * 0.5,
      0,
      sx,
      sy - r * 0.5,
      r * 0.8
    );
    domeGradient.addColorStop(0, "rgba(180, 220, 255, 0.8)");
    domeGradient.addColorStop(1, "rgba(100, 150, 200, 0.4)");
    ctx.fillStyle = domeGradient;
    ctx.beginPath();
    ctx.arc(sx, sy - r * 0.3, r * 0.8, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Blinking lights
    const numLights = 5;
    for (let i = 0; i < numLights; i++) {
      const angle = (i / numLights) * Math.PI * 2 + this.lightAnimation;
      const lightX = sx + Math.cos(angle) * r * 1.8;
      const lightY = sy + Math.sin(angle) * r * 0.6;
      const intensity =
        0.5 + Math.sin(angle * 5 + this.lightAnimation * 10) * 0.5;

      if (Math.cos(angle + Math.PI / 2) > 0) {
        // Only draw lights on the front
        ctx.fillStyle = `rgba(255, 100, 100, ${intensity})`;
        ctx.beginPath();
        ctx.arc(lightX, lightY, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
