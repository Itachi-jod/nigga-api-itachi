import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: "Missing avatar URL" });
  }

  try {
    // Load background template (single person template)
    const template = await loadImage("https://i.ibb.co/4ZsQJk5Y/image.jpg");

    // Load avatar
    const avatarResp = await axios.get(avatar, { responseType: "arraybuffer" });
    const avatarImg = await loadImage(Buffer.from(avatarResp.data));

    // Create canvas with template size
    const canvas = createCanvas(466, 659); // same size as template
    const ctx = canvas.getContext("2d");

    // Draw background template
    ctx.drawImage(template, 0, 0, 466, 659);

    // === Avatar placement with circular mask ===
    ctx.save();
    ctx.beginPath();
    ctx.arc(150 + 55, 76 + 55, 55, 0, Math.PI * 2, true); // adjust according to template
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 150, 76, 110, 110); // avatar size and position
    ctx.restore();

    // Output image
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
