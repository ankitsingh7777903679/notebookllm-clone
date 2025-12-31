import { driveRoutes } from "@/app/http/controllers/drive/routes/driveRoutes";
import { createNoteRoute } from "@/app/http/controllers/notes/routes/createNoteRoutes";
import { Router, Express } from "express";




export function apiV1(app:Express, router: Router){
    const driveRoute = driveRoutes(router)
    const createNote=createNoteRoute(router)

    app.use('/api/v1', driveRoute, createNote)
}