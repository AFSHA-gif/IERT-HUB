import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfsDir = path.join(__dirname, '..', 'public', 'pdfs');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateMinimalPDF(title, content) {
  const streamText = `BT /F1 20 Tf 50 750 Td (${title}) Tj ET BT /F1 12 Tf 50 700 Td (${content}) Tj ET BT /F1 10 Tf 50 650 Td (IERT HUB - B.Tech Cyber Security Semester 3 Resource) Tj ET`;
  const streamLength = streamText.length;

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000244 00000 n 
0000000344 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
424
%%EOF`;
}

const samplePdfs = [
  {
    path: 'notes/cs301-unit1.pdf',
    title: 'Data Structures Unit 1 Notes',
    content: 'Arrays, Stacks, Queues, Algorithm Analysis, Time & Space Complexity'
  },
  {
    path: 'notes/cs301-unit2.pdf',
    title: 'Data Structures Unit 2 Notes',
    content: 'Linked Lists, Singly & Doubly Linked Lists, Circular Queues'
  },
  {
    path: 'notes/cy301-unit1.pdf',
    title: 'Cyber Security Fundamentals Unit 1',
    content: 'Introduction to Information Security, Threat Landscape, CIA Triad'
  },
  {
    path: 'notes/cs303-unit1.pdf',
    title: 'Operating Systems Unit 1',
    content: 'OS Concepts, Process Management, CPU Scheduling Algorithms'
  },
  {
    path: 'pyq/cs301-2024.pdf',
    title: 'Data Structures 2024 End-Sem Paper',
    content: 'Official IERT B.Tech Cyber Security Sem 3 End Semester Question Paper'
  },
  {
    path: 'pyq/cy301-2024.pdf',
    title: 'Cyber Security Fundamentals 2024 PYQ',
    content: 'Official IERT B.Tech Cyber Security Sem 3 Mid Semester & End Semester PYQ'
  },
  {
    path: 'practicals/cy301-exp1.pdf',
    title: 'Practical Exp 1: Packet Analysis with Wireshark',
    content: 'Cyber Security Lab Experiment 1 - Wireshark PCAP analysis and filtering rules'
  },
  {
    path: 'practicals/cs301-exp1.pdf',
    title: 'Practical Exp 1: Stack & Queue C Implementation',
    content: 'Data Structures Lab Experiment 1 - Array and Pointer implementations'
  },
  {
    path: 'assignments/cy301-assign1.pdf',
    title: 'Cyber Security Assignment 1',
    content: 'Symmetric & Asymmetric Encryption Problems & Hash Functions Worksheets'
  },
  {
    path: 'study/cyber-cheatsheet.pdf',
    title: 'Cyber Security & Cryptography Cheat Sheet',
    content: 'Quick Reference for Ciphers, Port Numbers, Networking Protocols & Command Line Tools'
  },
  {
    path: 'syllabus/btech-cyber-sem3.pdf',
    title: 'B.Tech Cyber Security Sem 3 Official Syllabus',
    content: 'Complete Curriculum, Course Outcomes, Marking Scheme & Recommended Textbooks'
  }
];

ensureDir(pdfsDir);

samplePdfs.forEach(file => {
  const fullPath = path.join(pdfsDir, file.path);
  ensureDir(path.dirname(fullPath));
  const pdfContent = generateMinimalPDF(file.title, file.content);
  fs.writeFileSync(fullPath, pdfContent);
  console.log(`Generated: ${file.path}`);
});

console.log('Sample PDFs created successfully.');
