export class Planet {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * this.canvas.width * 2 - this.canvas.width;
    this.y = Math.random() * this.canvas.height * 2 - this.canvas.height;
    this.z = Math.random() * this.canvas.width + this.canvas.width * 1.5;

    // Each planet now gets a palette of 2 or more colors for a banded/mixed look.
    const colorSchemes = [
      ["#e76f51", "#f4a261", "#e9c46a"], // Fiery/Desert planet
      ["#264653", "#2a9d8f", "#8ab17d"], // Earth-like tones
      ["#03045e", "#0077b6", "#00b4d8", "#90e0ef"], // Blue gas giant
      ["#583101", "#926c15", "#c3a335", "#ebd888"], // Gold/Brown gas giant
      ["#4c0070", "#79018c", "#a220b9", "#c355d4"], // Purple nebula-like
    ];

    this.colors = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    this.hasRings = Math.random() > 0.1; // Increased the chance of rings
    this.rotation = Math.random() * Math.PI * 2;
    this.bandRotation = Math.random() * Math.PI * 2; // Separate rotation for color bands
  }

  update(deltaTime, speed) {
    this.z -= speed * 0.2 * deltaTime;
    if (this.z < 1) {
      // Reset planet when it goes behind the camera
      this.z = this.canvas.width * 2.5;
      this.x = Math.random() * this.canvas.width * 2 - this.canvas.width;
      this.y = Math.random() * this.canvas.height * 2 - this.canvas.height;
    }
  }

  show(ctx) {
    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;
    const r = Math.max(
      10,
      ((this.canvas.width - this.z) / this.canvas.width) * 50
    );

    // Draw the back half of the rings first
    if (this.hasRings && r > 15) {
      ctx.strokeStyle = "rgba(220, 220, 220, 0.6)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const ringRadiusX = r * (1.6 + i * 0.15);
        const ringRadiusY = r * (0.5 + i * 0.05);
        ctx.ellipse(
          sx,
          sy,
          ringRadiusX,
          ringRadiusY,
          this.rotation,
          0,
          Math.PI
        );
        ctx.stroke();
      }
    }

    // Create a linear gradient for the multi-colored bands
    const gradient = ctx.createLinearGradient(
      sx - r * Math.cos(this.bandRotation),
      sy - r * Math.sin(this.bandRotation),
      sx + r * Math.cos(this.bandRotation),
      sy + r * Math.sin(this.bandRotation)
    );

    // Add all the planet's colors to the gradient
    this.colors.forEach((color, index) => {
      gradient.addColorStop(index / (this.colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Add a shadow to create a matte, spherical effect instead of a flat circle
    const shadowGradient = ctx.createRadialGradient(sx, sy, r * 0.7, sx, sy, r);
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");

    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Draw the front half of the rings on top of the planet
    if (this.hasRings && r > 15) {
      ctx.strokeStyle = "rgba(220, 220, 220, 0.6)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const ringRadiusX = r * (1.6 + i * 0.15);
        const ringRadiusY = r * (0.5 + i * 0.05);
        ctx.ellipse(
          sx,
          sy,
          ringRadiusX,
          ringRadiusY,
          this.rotation,
          Math.PI,
          2 * Math.PI
        );
        ctx.stroke();
      }
    }
  }
}
