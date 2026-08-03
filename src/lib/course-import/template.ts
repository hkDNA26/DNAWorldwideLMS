import ExcelJS from "exceljs";

const BRAND_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1D4F8C" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" } };

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = BRAND_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  row.height = 24;
}

export async function buildCourseTemplateWorkbook(): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DNA Worldwide";
  workbook.created = new Date();

  // ---- Instructions ------------------------------------------------------
  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [{ width: 100 }];
  const lines = [
    "How to use this template",
    "",
    "1. Course Info — fill in one row describing the course itself.",
    "   Banner Image must be a Dropbox share link to an image (jpg/png/webp).",
    "",
    "2. Parts — one row per part of the course (Part 1, Part 2, ...).",
    "   Video Link must be a Dropbox share link to a video file. Each part has exactly one video.",
    "",
    "3. Quiz Questions — one row per question. Leave this sheet empty for a part with no quiz.",
    "   Put the question's Part Number in the first column to attach it to that part.",
    "   Question Type is either \"Multiple Choice\" or \"True/False\".",
    "   For Multiple Choice: fill in whichever Option columns you need (2 to 4) and leave the rest",
    "   blank, then set Correct Answer to the letter (A-D) of the right option.",
    "   For True/False: leave the Option columns blank and set Correct Answer to \"True\" or \"False\".",
    "",
    "Uploading: go to My Courses → Import from Excel, and upload this file once it's filled in.",
    "The new course is created as a Draft so you can review it in the course builder before publishing.",
  ];
  lines.forEach((line, i) => {
    const cell = instructions.getCell(`A${i + 1}`);
    cell.value = line;
    if (i === 0) cell.font = { bold: true, size: 14 };
  });

  // ---- Course Info --------------------------------------------------------
  const courseInfo = workbook.addWorksheet("Course Info");
  courseInfo.columns = [
    { header: "Course Title", key: "title", width: 32 },
    { header: "Description", key: "description", width: 50 },
    { header: "Estimated Time", key: "estimatedTime", width: 18 },
    { header: "Banner Image (Dropbox link)", key: "bannerImage", width: 45 },
  ];
  styleHeaderRow(courseInfo.getRow(1));
  const courseExample = courseInfo.addRow({
    title: "Example: Workplace Drug Testing Basics",
    description: "An introduction to workplace drug testing procedures and compliance.",
    estimatedTime: "45 minutes",
    bannerImage: "https://www.dropbox.com/s/xxxxxxx/banner.jpg?dl=0",
  });
  courseExample.font = { italic: true, color: { argb: "FF94A3B8" } };

  // ---- Parts ---------------------------------------------------------------
  const parts = workbook.addWorksheet("Parts");
  parts.columns = [
    { header: "Part Number", key: "partNumber", width: 14 },
    { header: "Part Title", key: "title", width: 32 },
    { header: "Video Link (Dropbox)", key: "videoUrl", width: 50 },
  ];
  styleHeaderRow(parts.getRow(1));
  const partExample = parts.addRow({
    partNumber: 1,
    title: "Example: Introduction",
    videoUrl: "https://www.dropbox.com/s/xxxxxxx/part1.mp4?dl=0",
  });
  partExample.font = { italic: true, color: { argb: "FF94A3B8" } };

  // ---- Quiz Questions --------------------------------------------------------
  const quiz = workbook.addWorksheet("Quiz Questions");
  quiz.columns = [
    { header: "Part Number", key: "partNumber", width: 14 },
    { header: "Question Number", key: "questionNumber", width: 16 },
    { header: "Question Type", key: "questionType", width: 18 },
    { header: "Question Text", key: "questionText", width: 45 },
    { header: "Option A", key: "optionA", width: 22 },
    { header: "Option B", key: "optionB", width: 22 },
    { header: "Option C", key: "optionC", width: 22 },
    { header: "Option D", key: "optionD", width: 22 },
    { header: "Correct Answer", key: "correctAnswer", width: 16 },
  ];
  styleHeaderRow(quiz.getRow(1));
  const quizExample1 = quiz.addRow({
    partNumber: 1,
    questionNumber: "Q1",
    questionType: "Multiple Choice",
    questionText: "Example: What is the standard chain-of-custody form used for?",
    optionA: "Tracking sample handling",
    optionB: "Billing the client",
    optionC: "Scheduling appointments",
    optionD: "",
    correctAnswer: "A",
  });
  quizExample1.font = { italic: true, color: { argb: "FF94A3B8" } };

  const quizExample2 = quiz.addRow({
    partNumber: 1,
    questionNumber: "Q2",
    questionType: "True/False",
    questionText: "Example: A chain-of-custody form is required for every sample.",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "True",
  });
  quizExample2.font = { italic: true, color: { argb: "FF94A3B8" } };

  // Data validation for the next 300 rows
  for (let r = 2; r <= 300; r++) {
    quiz.getCell(`C${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"Multiple Choice,True/False"'],
    };
    quiz.getCell(`I${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"A,B,C,D,True,False"'],
    };
  }

  return workbook.xlsx.writeBuffer();
}
