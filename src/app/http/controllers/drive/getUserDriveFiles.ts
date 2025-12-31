import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { google } from "googleapis";
import { next } from 'node_modules/cheerio/dist/esm/api/traversing';
export async function getUserDriveFiles(req: Request, res: Response, next: NextFunction) {
    try {
        // get user + google token from your session/db 
        const user = req.user as any;
        console.log('User in getUserDriveFiles:', user);
        
        // Check if user is authenticated
        if (!user) {
            return res.status(401).json({ message: "Not authenticated. Please sign in first." });
        }

        // Access tokens from the correct location in the user object
        const googleAccessToken = user?.authData?.googleAccessToken || user?.googleAccessToken;
        const googleRefreshToken = user?.authData?.googleRefreshToken || user?.googleRefreshToken;

        if (!googleAccessToken) {
            return res.status(401).json({ message: "No Google access token found. Please authenticate with Google." });
        }

        const oauth2Client = new google.auth.OAuth2({
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            client_id: process.env.GOOGLE_CLIENT_ID as string
        });

        oauth2Client.setCredentials({
            access_token: googleAccessToken,
            refresh_token: googleRefreshToken
        });

        const drive = google.drive({ version: "v3", auth: oauth2Client });

        const response = await drive.files.list({
            pageSize: 10,
            fields: "files(id, name, mimeType, webViewLink)",
        });
        res.json(response.data.files);

    } catch (err: any) {
        console.error('Drive files fetch error:', err?.message || err);
        // if Google API provided a response body, log it
        if (err?.response?.data) console.error('Google API error response:', JSON.stringify(err.response.data, null, 2));
        const errorDetail = err?.response?.data || err?.message || 'Unknown error';
        res.status(500).json({ message: "Failed to fetch Drive files", error: errorDetail });
    }
}  