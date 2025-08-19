export class Comet {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    // Start the comet far away and off-screen
    this.z = Math.random() * this.canvas.width + this.canvas.width * 2;
    this.x = Math.random() * this.canvas.width * 4 - this.canvas.width * 2;
    this.y = Math.random() * this.canvas.height * 4 - this.canvas.height * 2;

    // Set a velocity vector to make it streak across the screen
    this.vz = -(2 + Math.random() * 2); // Speed towards the camera
    this.vx =
      ((this.canvas.width / 2 - this.x) / (this.z / -this.vz)) *
      (0.5 + Math.random() * 0.5);
    this.vy =
      ((this.canvas.height / 2 - this.y) / (this.z / -this.vz)) *
      (0.5 + Math.random() * 0.5);

    this.tail = [];
    this.tailLength = 15 + Math.floor(Math.random() * 10);
  }

  update(deltaTime, speed) {
    // Update position based on velocity
    this.x += this.vx * speed * deltaTime;
    this.y += this.vy * speed * deltaTime;
    this.z += this.vz * speed * deltaTime;

    // Add current position to the tail history
    this.tail.push({ x: this.x, y: this.y, z: this.z });
    if (this.tail.length > this.tailLength) {
      this.tail.shift(); // Remove the oldest point
    }

    // Reset the comet if it's flown past the camera
    if (this.z < 1) {
      this.reset();
    }
  }

  show(ctx) {
    // Calculate the head's current screen position
    const sx =
      ((this.x / this.z) * this.canvas.width) / 2 + this.canvas.width / 2;
    const sy =
      ((this.y / this.z) * this.canvas.height) / 2 + this.canvas.height / 2;
    const r = Math.max(
      0.1,
      ((this.canvas.width - this.z) / this.canvas.width) * 4
    );

    // Draw the tail
    this.tail.forEach((point, index) => {
      const pointSx =
        ((point.x / point.z) * this.canvas.width) / 2 + this.canvas.width / 2;
      const pointSy =
        ((point.y / point.z) * this.canvas.height) / 2 + this.canvas.height / 2;
      const pointR = Math.max(
        0.1,
        ((this.canvas.width - point.z) / this.canvas.width) * 4
      );

      // The tail fades and shrinks as it gets older
      const opacity = (index / this.tail.length) * 0.5;
      const size = (index / this.tail.length) * pointR;

      if (point.z > 1) {
        ctx.fillStyle = `rgba(180, 220, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(pointSx, pointSy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw the comet's head
    if (r > 0.5) {
      const headGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      headGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      headGradient.addColorStop(0.8, "rgba(200, 220, 255, 0.8)");
      headGradient.addColorStop(1, "rgba(180, 220, 255, 0)");

      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
