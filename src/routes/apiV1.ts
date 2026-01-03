import { get } from 'lodash';
import { driveRoutes } from "@/app/http/controllers/drive/routes/driveRoutes";
import { createNoteRoute } from "@/app/http/controllers/notes/routes/createNoteRoute";
import { updateNoteRoute } from "@/app/http/controllers/notes/routes/updateNoteRoute";
import { Router, Express } from "express";
import { getAllNoteRoutes } from '@/app/http/controllers/notes/routes/getAllNoteRoute';
import { summaryRoutes } from '@/app/http/controllers/notes/routes/summaryRoutes';
import { briefingRoutes } from '@/app/http/controllers/notes/routes/briefingDocRoute';
import { faqRoutes } from '@/app/http/controllers/notes/routes/faqRoute';
import { studyGuideRoutes } from '@/app/http/controllers/notes/routes/studyGuideRoute';
import { mindMapRoutes } from '@/app/http/controllers/notes/routes/mindMapRoute';




export function apiV1(app: Express, router: Router) {
    const driveRoute = driveRoutes(router)
    const createNote = createNoteRoute(router)
    const updateNote = updateNoteRoute(router)
    const getAllNotesRoute = getAllNoteRoutes(router)
    const summaryRoute = summaryRoutes(router)
    const briefingDocRoute = briefingRoutes(router)
    const faqRoute = faqRoutes(router)
    const studyGuideRoute = studyGuideRoutes(router)
    const mindMapRoute = mindMapRoutes(router)


    app.use('/api/v1', driveRoute, createNote, updateNote, getAllNotesRoute, summaryRoute, briefingDocRoute,
        briefingDocRoute, faqRoute, studyGuideRoute, mindMapRoute, mindMapRoute
    )
}