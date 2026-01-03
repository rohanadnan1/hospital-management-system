import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
         cb(null, 'public/uploads')
   },
  filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});



