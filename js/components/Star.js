export class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * this.canvas.width - this.canvas.width / 2;
    this.y = Math.random() * this.canvas.height - this.canvas.height / 2;
    this.z = Math.random() * this.canvas.width;
    this.pz = this.z;
  }
  update(deltaTime, speed) {
    this.z -= speed * deltaTime;
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
      1,
      ((this.canvas.width - this.z) / this.canvas.width) * 2.5
    );
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    const px =
      ((this.x / this.pz) * this.canvas.width) / 2 + this.canvas.width / 2;
    const py =
      ((this.y / this.pz) * this.canvas.height) / 2 + this.canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = r;
    ctx.stroke();
    this.pz = this.z;
  }
}
