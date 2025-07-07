// functions/index.ts
import {onRequest} from "firebase-functions/v2/https";
import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses";
import type {Request, Response} from "express";

// One SES client reused by all invocations
const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const sendMail = onRequest(
  {
    cors: [
      "http://localhost:8081",
      "https://<your-github-user>.github.io",
      "*",
    ],
    secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
  },
  async (req: Request, res: Response): Promise<void> => {
    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }

    const {to, subject, html, from, cc, replyTo} = req.body as {
      to: string;
      subject: string;
      html: string;
      from?: string;
      cc?: string;
      replyTo?: string;
    };

    if (!to || !subject || !html) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    try {
      const cmd = new SendEmailCommand({
        Destination: {
          ToAddresses: [to],
          CcAddresses: cc ? [cc] : undefined,
        },
        Message: {
          Subject: {Data: subject, Charset: "UTF-8"},
          Body: {Html: {Data: html, Charset: "UTF-8"}},
        },
        Source: from ?? "Your App <no-reply@yourdomain.com>",
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
      });

      await ses.send(cmd);
      res.json({success: true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: (err as Error).message});
    }
  }
);
