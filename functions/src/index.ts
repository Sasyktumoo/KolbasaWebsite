import {onRequest} from "firebase-functions/v2/https";
import {google} from "googleapis";
import type {Request, Response} from "express";

export const sendMail = onRequest(
  {
    cors: [
      "http://localhost:8081", // dev origin
      "https://YOURNAME.github.io", // prod origin - replace with real domain
    ],
    secrets: ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN"],
  },
  async (req: Request, res: Response): Promise<void> => {
    // Preflight
    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }

    // Create OAuth client AFTER secrets are injected
    const auth = new google.auth.OAuth2(
      process.env.CLIENT_ID!,
      process.env.CLIENT_SECRET!
    );
    auth.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

    const {to, subject, html, from, cc, replyTo} = req.body as {
      to: string;
      subject: string;
      html: string;
      from?: string;
      cc?: string;
      replyTo?: string;
    };

    try {
      const gmail = google.gmail({version: "v1", auth});

      // Create a properly encoded email
      const str = [
        `From: ${from || "Магазин Колбасы <noreply@kolbasa-shop.com>"}`,
        `To: ${to}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
        cc ? `Cc: ${cc}` : "",
        replyTo ? `Reply-To: ${replyTo}` : "",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=utf-8",
        "",
        html,
      ].filter(Boolean).join("\r\n");

      // Base64URL encode
      const encodedMessage = Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {raw: encodedMessage},
      });

      res.json({ok: true, message: "Email sent successfully"});
    } catch (err) {
      console.error("Error sending email:", err);
      res.status(500).json({error: (err as Error).message});
    }
  }
);
