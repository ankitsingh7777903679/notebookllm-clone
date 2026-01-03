import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { DocRepository } from '../repositorys/DocRepository';






export async function getStudyGuide(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId}:Record<string, any> = req.query;
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId, noteId});
        if(!doc) throw new Error("Document not found")


        return res.status(200).send({studyGuide:doc?.studyGuide})


    } catch (error) {
        next(error)
    }
}