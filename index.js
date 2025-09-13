import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: "Missing avatar URL" });
  }

  try {
    // Load template
    const template = await loadImage("https://i.ibb.co/4ZsQJk5Y/image.jpg");

    // Load avatar
    const avatarResp = await axios.get(avatar, { responseType: "arraybuffer" });
    const avatarImg = await loadImage(Buffer.from(avatarResp.data));

    // Create canvas with template size
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Draw avatar over the man's profile (fill entire area)
    // Adjust these coordinates & size to perfectly cover the profile
    const avatarX = 70; // x-position of man’s face
    const avatarY = 35; // y-position of man’s face
    const avatarWidth = 130; // width to cover
    const avatarHeight = 130; // height to cover
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);

    // Output
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
      }
