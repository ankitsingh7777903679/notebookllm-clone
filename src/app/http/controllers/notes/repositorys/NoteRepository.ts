// import { User } from "@/app/models/userSchema";

import agenda from "@/app/bootstrap/agenda/agenda";
import { generateTokens, signAccessToken, signRefreshToken } from "@/app/helpers/jwt";
import { Note } from "@/app/models/noteSchema";
import { User } from "@/app/models/userSchema";
import { GoogleUserType } from "@/types/user-types";
import { promise } from "zod";

export class NoteRepository {
    private static instance: NoteRepository;



    public static getInstance(): NoteRepository {
        if (!NoteRepository.instance) {
            NoteRepository.instance = new NoteRepository();
        }
        return NoteRepository.instance;

    }

    async createNote(noteProps: { title: string, image: string, userId: string },
        imageProps: { generateImagePrompt: String, uploadsDir: String, randomName: String }
    ) {

        const note = new Note({
            ...noteProps

        })
        const newNote = await note.save();

        agenda.now("generateImage", {
            noteId: newNote.toObject()._id,
            ...imageProps // required attr
        });
        return newNote.toObject();

    }

    async updateNotes(props: { id: string, title: string }) {
        const updateNote = await Note.findByIdAndUpdate(props.id,
            { title: props.title }, { new: true, runValidators: true });
        return updateNote
    }

    async getA11Notes({
        search = '',
        page = 1,
        limit = 10,
    }: {

        search?: string;
        page?: number;
        limit?: number;
    }) 
    {
        // console.log("Search: ", search);
        // console.log("Page: ", page);
        // console.log("Limit: ", limit);
        const skip = (page - 1) * limit; //.Build filter 
        const filter: any = {};
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search, $options: "i"
                    }
                },
            ];
        }

        const [notes, total] = await Promise.all([
            Note.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }) // newest first 
                .lean(),
            Note.countDocuments(filter),
        ]);

        return {
            notes, pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };

    }








}

