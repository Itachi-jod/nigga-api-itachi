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

    // === Draw avatar on head with circular mask ===
    const avatarX = 260; // adjust to center on head
    const avatarY = 30;  // adjust to top of head
    const avatarSize = 70; // fit the head properly

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Send PNG
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
