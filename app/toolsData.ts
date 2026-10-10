export type Tool = {
  name: string;
  href: string;
  icon: string; // must match a key in ICON_MAP (see page.tsx / tools/page.tsx)
  description: string;
  category: string;
  trending: boolean;
};
export const TOOLS: Tool[] = [
  {
    name: "Image Compressor",
    href: "/tools/image-compressor",
    icon: "Minimize2",
    description: "Shrink JPG, PNG or WebP files without losing visible quality.",
    category: "Image",
    trending: true,
  },
  {
    name: "QR Code Generator",
    href: "/tools/qr-code-generator",
    icon: "QrCode",
    description: "Turn any text or link into a scannable QR code instantly.",
    category: "Generator",
    trending: true,
  },
  {
    name: "PDF to Word",
    href: "/tools/pdf-to-word",
    icon: "FileText",
    description: "Convert your PDF into an editable Word document.",
    category: "PDF",
    trending: true,
  },
   {
    name: "PDF Merge",
    href: "/tools/pdf-merge",
    icon: "Combine",
    description: "Combine multiple PDF files into one, in the order you choose.",
    category: "PDF",
    trending: true,
  },
    {
    name: "Compress PDF",
    href: "/tools/compress-pdf",
    icon: "FileDown",
    description: "Reduce PDF file size, best for text-based documents.",
    category: "PDF",
    trending: true,
  },
    {
    name: "Image Resizer",
    href: "/tools/image-resizer",
    icon: "Move",
    description: "Resize images to exact dimensions or social media presets.",
    category: "Image",
    trending: true,
  },
    {
    name: "Password Generator",
    href: "/tools/password-generator",
    icon: "KeyRound",
    description: "Create strong, random passwords with custom length and characters.",
    category: "Generator",
    trending: false,
  },
    {
    name: "Word to PDF",
    href: "/tools/word-to-pdf",
    icon: "FileType",
    description: "Convert Word documents (DOC, DOCX) into PDF in seconds.",
    category: "PDF",
    trending: true,
  },
    {
    name: "Split PDF",
    href: "/tools/split-pdf",
    icon: "Scissors",
    description: "Extract pages or split a PDF into separate files.",
    category: "PDF",
    trending: true,
  },
  {
  name: "Remove PDF Pages",
  href: "/tools/remove-pdf-pages",
  icon: "Scissors",
  description: "Delete unwanted pages from your PDF document instantly in your browser.",
  category: "PDF",
  trending: true,
},
{
  name: "Extract PDF Pages",
  href: "/tools/extract-pdf-pages",
  icon: "FileOutput",
  description: "Extract specific pages or page ranges from your PDF into a brand new document.",
  category: "PDF",
  trending: true,
},
{
  name: "Organize PDF Pages",
  href: "/tools/organize-pdf",
  icon: "Move",
  description: "Reorder, arrange, or delete pages in your PDF document with easy drag and drop.",
  category: "PDF",
  trending: true,
},
{
  name: "Protect PDF",
  href: "/tools/protect-pdf",
  icon: "KeyRound",
  description: "Encrypt your PDF document with a password to prevent unauthorized access.",
  category: "PDF",
  trending: false,
},
{
  name: "Unlock PDF",
  href: "/tools/unlock-pdf",
  icon: "KeyRound",
  description: "Remove password security from your protected PDF file.",
  category: "PDF",
  trending: false,
},
];