import {onRequest} from "firebase-functions/v2/https";
import {google} from "googleapis";
import type {Request, Response} from "express";

export const sendMail = onRequest(
  {
    cors: [
      "http://localhost:8081",
      "https://<your-github-user>.github.io",
      "*",
    ],
    secrets: ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN"],
  },
  async (req: Request, res: Response): Promise<void> => {
    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }

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

    // Validate required fields
    if (!to || !subject || !html) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    try {
      const gmail = google.gmail({version: "v1", auth});

      // Build email headers
      const headers = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/html; charset=UTF-8",
      ];

      // Add optional headers if provided
      if (from) headers.push(`From: ${from}`);
      if (cc) headers.push(`Cc: ${cc}`);
      if (replyTo) headers.push(`Reply-To: ${replyTo}`);

      // Create the raw email
      const raw = Buffer.from(
        [...headers, "", html].join("\r\n")
      ).toString("base64url");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {raw},
      });

      res.json({success: true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: (err as Error).message});
    }
  }
);
