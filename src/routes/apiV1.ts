import { get } from 'lodash';
import { driveRoutes } from "@/app/http/controllers/drive/routes/driveRoutes";
import { createNoteRoute } from "@/app/http/controllers/notes/routes/createNoteRoute";
import { updateNoteRoute } from "@/app/http/controllers/notes/routes/updateNoteRoute";
import { Router, Express } from "express";
import { getAllNoteRoutes } from '@/app/http/controllers/notes/routes/getAllNoteRoute';
import { summaryRoutes } from '@/app/http/controllers/notes/routes/summaryRoutes';




export function apiV1(app:Express, router: Router){
    const driveRoute = driveRoutes(router)
    const createNote= createNoteRoute(router)
    const updateNote = updateNoteRoute(router)
    const getAllNotesRoute = getAllNoteRoutes(router)
    const summaryRoute = summaryRoutes(router)

    app.use('/api/v1', driveRoute, createNote, updateNote, getAllNotesRoute, summaryRoute)
}