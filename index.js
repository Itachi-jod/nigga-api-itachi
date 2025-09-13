import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar1, avatar2 } = req.query;

  if (!avatar1 || !avatar2) {
    return res.status(400).json({ error: "Missing avatar1 or avatar2 URL" });
  }

  try {
    // Load background template
    const template = await loadImage("https://i.ibb.co/YFJrLSpL/image.jpg");

    // Load avatars
    const avatar1Resp = await axios.get(avatar1, { responseType: "arraybuffer" });
    const avatarImg1 = await loadImage(Buffer.from(avatar1Resp.data));

    const avatar2Resp = await axios.get(avatar2, { responseType: "arraybuffer" });
    const avatarImg2 = await loadImage(Buffer.from(avatar2Resp.data));

    // Create canvas same size as template
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // === Avatar 1: man profile pic ===
    ctx.save();
    const manX = 180; // X position of man profile (adjusted for template)
    const manY = 40;  // Y position
    const manSize = 120; // Diameter
    ctx.beginPath();
    ctx.arc(manX + manSize / 2, manY + manSize / 2, manSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg1, manX, manY, manSize, manSize);
    ctx.restore();

    // === Avatar 2: secondary avatar ===
    ctx.save();
    const avatarX = 245; // X position
    const avatarY = 305; // Y position
    const avatarSize = 100; // Diameter
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg2, avatarX, avatarY, avatarSize, avatarSize);
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
