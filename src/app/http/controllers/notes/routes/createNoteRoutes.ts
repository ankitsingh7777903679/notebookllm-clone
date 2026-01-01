import multer from "multer"; 
import path from "path"; import fs from "fs"; 
import { Response, Router } from "express"; 
import { cwd } from "process"; 
import { loadDocument } from "../loaders";
import { createNote } from "../createNote";

const currentDir = cwd();

// Ensure uploads folder exists 
const uploadsDir = path.join(currentDir, "public", "uploads"); 
if (!fs.existsSync(uploadsDir)) { 
    fs.mkdirSync(uploadsDir, { recursive: true});
}

// Multer config 
const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, uploadsDir);  
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); 
        const ext = path.extname(file.originalname); 
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

const documentFileFilter = (req: any, file: any, cb: (error: any, acceptFile: boolean) => void) => {
    const allowedTypes = /pdf|doc|docx|html|csv|txt/;
    const isDoc = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname);
    if (isDoc) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only documents are allowed (pdf, doc, docx, txt)."), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter: documentFileFilter, 
    limits: { fileSize: 2* 1024*1024}//2MB

});

export function createNoteRoute(router: Router) { 
    router.post("/upload-documents", upload.single("doc"), createNote); 
    return router;  
}

