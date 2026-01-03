import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from '../repositorys/NoteRepository';
import { cwd } from 'process';
import path from 'path/win32';
import { DocRepository } from '../repositorys/DocRepository';
import { loadDocument } from '../loaders/loaders';
import { LLM } from '@/app/llm/LLM';
import { generateStudyGuide } from '@/pipelines/study-guide';





export async function updateOrCreateStudyGuide(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId}:Record<string, string> = req.body;
        // console.log("userId, noteId", userId, noteId);
        // console.log("req.body", req.body);
        const llm = LLM.getInstance()
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId, noteId});
        // console.log("doc", doc);
        if(!doc) throw new Error("Document not found")

        const currentDir = cwd(); 
        const uploadsDir = path. join(currentDir, "public", "uploads"); 
        const docFullPath=`${uploadsDir}/${(doc as any)?.fileName}`;

        const splittingDocs = await loadDocument(docFullPath)
        const studyGuideResult = await generateStudyGuide(llm, splittingDocs)
        const studyGuide = studyGuideResult?.finalStudyGuides ?? ''
        await docRepo.updateStudyGuide({userId, noteId, studyGuide})

        return res.status(200).send({message: "studyGuide generated successfully", studyGuide})

    } catch (error) {
        next(error)
    }
}