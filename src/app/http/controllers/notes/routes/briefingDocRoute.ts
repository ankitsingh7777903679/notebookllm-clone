import { Router } from "express";
import { getBriefingDoc } from "../briefingdoc/getBriefingDoc";
// import { updateOrCreateFaq } from "../briefingdoc/updateOrCreateBriefingDoc";
import { updateOrCreateBriefingDoc } from "../briefingdoc/updateOrCreateBriefingDoc";





export function briefingRoutes(router: Router){
    router.get('/notes/briefing-doc', getBriefingDoc)
    router.put('/notes/briefing-doc', updateOrCreateBriefingDoc)
    return router
}