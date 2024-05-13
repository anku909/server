import multer from "multer";

const storage = multer.memoryStorage(); // Use memory storage to handle readable streams

const upload = multer({ storage: storage });

export { upload };
