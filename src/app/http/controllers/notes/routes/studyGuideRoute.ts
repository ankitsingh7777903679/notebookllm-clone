import { Router } from "express";
import { getStudyGuide } from "../studyGuide/getStudyGuide";
import { updateOrCreateStudyGuide } from "../studyGuide/updateOrCreateStudyGuide";





export function studyGuideRoutes(router: Router){
    router.get('/notes/StudyGuide', getStudyGuide)
    router.put('/notes/StudyGuide', updateOrCreateStudyGuide)
    return router
}