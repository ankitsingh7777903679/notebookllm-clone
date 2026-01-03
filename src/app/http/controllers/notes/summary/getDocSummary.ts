import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { DocRepository } from '../repositorys/DocRepository';






export async function getDocSummary(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId} = req.query;
        // console.log("userId, noteId", userId, noteId);
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId: userId as string, noteId: noteId as string});
        // console.log("doc", doc);
        if(!doc) throw new Error("Document not found")


        return res.status(200).send({summary:doc?.summary})


    } catch (error) {
        next(error)
    }
}