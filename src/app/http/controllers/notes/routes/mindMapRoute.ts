import { Router } from "express";
import { createOrUpdateMindMap } from "../mindMap/createOrUpdateMindMap";
import { getMindMap } from "../mindMap/getMindMap";
// import { updateOrCreateFaq } from "../briefingdoc/updateOrCreateBriefingDoc";





export function mindMapRoutes(router: Router){
    router.get('/notes/mindMap', getMindMap)
    router.put('/notes/mindMap', createOrUpdateMindMap)
    return router
}