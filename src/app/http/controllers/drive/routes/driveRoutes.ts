import { Router } from "express";
import { getUserDriveFiles } from "../getUserDriveFiles";




export function driveRoutes(routes:Router){
    routes.get('/users/files', getUserDriveFiles)

    return routes
}