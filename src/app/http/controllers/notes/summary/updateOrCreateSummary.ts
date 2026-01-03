import express from 'express'
import { Express, NextFunction, Response, Request } from "express";
import { NoteRepository } from '../repositorys/NoteRepository';
import { cwd } from 'process';
import path from 'path/win32';
import { DocRepository } from '../repositorys/DocRepository';
import { loadDocument } from '../loaders/loaders';
import { generateSummary } from '@/pipelines/summary';
import { LLM } from '@/app/llm/LLM';





export async function updateOrCreateSummary(req: Request, res: Response, next: NextFunction) {
    try {

        // steps :  
        // -getFileName 
        // -splitIntoChunks
        // - call generateSummary 
        // -storeSummaryInDB  
        const {userId, noteId}:Record<string, any> = req.body;
        const llm = LLM.getInstance()
        const docRepo = DocRepository.getInstance()
        const doc = await docRepo.getSingleDoc({ userId, noteId});
        if(!doc) throw new Error("Document not found")

        const currentDir = cwd(); 
        const uploadsDir = path. join(currentDir, "public", "uploads"); 
        const docFullPath=`${uploadsDir}/${(doc as any)?.fileName}`;

        const splittingDocs = await loadDocument(docFullPath)
        const summaryResult = await generateSummary(llm, splittingDocs)
        const summary = summaryResult?.finalSummary ?? ''
        await docRepo.updateSummary({userId, noteId, summary})

        return res.status(200).send({message: "Summary generated successfully", summary})


    } catch (error) {
        next(error)
    }
}