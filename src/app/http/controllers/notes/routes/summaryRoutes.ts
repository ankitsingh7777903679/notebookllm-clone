import { Router } from "express";
import { getDocSummary } from "../getDocSummary";
import { updateOrCreateSummary } from "../updateOrCreateSummary";




export function summaryRoutes(router: Router){
    router.get('/note/summary', getDocSummary)
    router.put('/note/summary', updateOrCreateSummary)
    return router
}