import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { DocRepository } from '../repositorys/DocRepository';
import { generateMindMap } from '@/pipelines/mind-map';
import { LLM } from '@/app/llm/LLM';






export async function createOrUpdateMindMap(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId}:Record<string, any> = req.query;
        const llm = LLM.getInstance()
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId, noteId});
        if(!doc) {
            console.error(`Document not found - userId: ${userId}, noteId: ${noteId}`)
            throw new Error(`Document not found for userId: ${userId}, noteId: ${noteId}`)
        }

            const studyGuid = doc?.studyGuide
            if(!studyGuid) throw new Error("No data provided to generate mind map - study guide is missing")
            
            const mindMap = await generateMindMap(llm, studyGuid )    

           const storedMindMap = await docRepo.updateMindMap({userId, noteId, mindMap})
 

        return res.status(200).send({mindMap: storedMindMap})


    } catch (error) {
        next(error)
    }
}