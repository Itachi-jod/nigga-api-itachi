import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: "Missing avatar URL" });
  }

  try {
    // Load the background template
    const template = await loadImage("https://i.ibb.co/4ZsQJk5Y/image.jpg");

    // Load the avatar image
    const avatarResp = await axios.get(avatar, { responseType: "arraybuffer" });
    const avatarImg = await loadImage(Buffer.from(avatarResp.data));

    // Create canvas
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw the background template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // === Draw avatar in circle at the correct position ===
    // These numbers are measured from the template
    const centerX = 234; // x center of profile circle
    const centerY = 155; // y center of profile circle
    const radius = 65;   // radius of profile circle

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Draw avatar fully covering the circle
    ctx.drawImage(avatarImg, centerX - radius, centerY - radius, radius * 2, radius * 2);
    ctx.restore();

    // Send as PNG
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
