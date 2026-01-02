// import { User } from "@/app/models/userSchema";

import agenda from "@/app/bootstrap/agenda/agenda";
import { generateTokens, signAccessToken, signRefreshToken } from "@/app/helpers/jwt";
import { Doc } from "@/app/models/docSchema";
import { Note } from "@/app/models/noteSchema";
import { User } from "@/app/models/userSchema";
import { GoogleUserType } from "@/types/user-types";
import { Types } from "mongoose";
import { promise } from "zod";

export class DocRepository {
    private static instance: DocRepository;



    public static getInstance(): DocRepository {
        if (!DocRepository.instance) {
            DocRepository.instance = new DocRepository();
        }
        return DocRepository.instance;

    }

    async createDoc(docProps: { fileName: string, userId: string, noteId: Types.ObjectId, title: string },

    ) {

        const doc = new Doc({
            ...docProps

        })
        const newDoc = await doc.save();

        return newDoc.toObject();

    }


    async updateSummary(props: { userId: string, noteId: string, summary: string }) {
        const { userId, noteId, summary } = props;
        const updateSummary = await Doc.findOneAndUpdate({ userId, noteId },
            {
                $set: { summary }
            }, { new: true, runValidators: true }
        )

        if(!updateSummary){
            throw new Error("Document not found")
        }

        return updateSummary
    }


    async updateBriefingDoc(props: { userId: string, noteId: string, briefingDoc: string }) {
        const { userId, noteId, briefingDoc } = props;
        const row = await Doc.findOneAndUpdate({ userId, noteId },
            {
                $set: { briefingDoc }
            }, { new: true, runValidators: true }
        )

        if(!row){
            throw new Error("Document not found")
        }

        return row
    }


    async updateFaq(props: { userId: string, noteId: string, faq: string }) {
        const { userId, noteId, faq } = props;
        const row = await Doc.findOneAndUpdate({ userId, noteId },
            {
                $set: { faq }
            }, { new: true, runValidators: true }
        )

        if(!row){
            throw new Error("Document not found")
        }

        return row
    }


    async updateStudyGuide(props: { userId: string, noteId: string, studyGuide: string }) {
        const { userId, noteId, studyGuide } = props;
        const row = await Doc.findOneAndUpdate({ userId, noteId },
            {
                $set: { studyGuide }
            }, { new: true, runValidators: true }
        )

        if(!row){
            throw new Error("Document not found")
        }

        return row
    }

    async updateMindMap(props: { userId: string, noteId: string, mindMap: string }) {
        const { userId, noteId, mindMap } = props;
        const row = await Doc.findOneAndUpdate({ userId, noteId },
            {
                $set: { mindMap }
            }, { new: true, runValidators: true }
        )

        if(!row){
            throw new Error("Document not found")
        }

        return row
    }


    async getSingleDoc(props: {userId:string, noteId: string}){ 
        const doc=await Doc.findOne({ ... props}) 
        return doc  
    }


}

