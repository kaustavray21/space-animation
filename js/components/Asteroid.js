export class Asteroid {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
    this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
    this.z = Math.random() * this.canvas.width;
    this.pz = this.z;

    const colorSchemes = [
      { base: "#A9A9A9", highlight: "#D3D3D3", shadow: "#696969" },
      { base: "#808080", highlight: "#A9A9A9", shadow: "#404040" },
      { base: "#696969", highlight: "#808080", shadow: "#363636" },
      { base: "#8B4513", highlight: "#A0522D", shadow: "#5C2E0D" },
      { base: "#A0522D", highlight: "#CD853F", shadow: "#8B4513" },
    ];

    const scheme =
      colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    this.color = scheme.base;
    this.highlightColor = scheme.highlight;
    this.shadowColor = scheme.shadow;

    this.shape = [];
    this.craters = [];
    const vertices = 15 + Math.random() * 10;

    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.8;
      this.shape.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    const numCraters = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numCraters; i++) {
      const craterAngle = Math.random() * Math.PI * 2;
      const craterRadius = Math.random() * 0.6;
      this.craters.push({
        x: Math.cos(craterAngle) * craterRadius,
        y: Math.sin(craterAngle) * craterRadius,
        size: 0.1 + Math.random() * 0.2,
      });
    }
  }

  update(deltaTime, speed) {
    this.z -= speed * 0.5 * deltaTime;
    if (this.z < 1) {
      this.z = this.canvas.width;
      this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
      this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
      this.pz = this.z;
    }
  }

  show(ctx) {
    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;
    const r = Math.max(
      2,
      ((this.canvas.width - this.z) / this.canvas.width) * 15
    );

    const gradient = ctx.createRadialGradient(sx, sy, r * 0.1, sx, sy, r);
    gradient.addColorStop(0, this.highlightColor);
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.shadowColor);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(sx + this.shape[0].x * r, sy + this.shape[0].y * r);
    for (let i = 1; i < this.shape.length; i++) {
      ctx.lineTo(sx + this.shape[i].x * r, sy + this.shape[i].y * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.shadowColor;
    for (const crater of this.craters) {
      if (r > 5) {
        const craterX = sx + crater.x * r;
        const craterY = sy + crater.y * r;
        const craterR = crater.size * r;
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
