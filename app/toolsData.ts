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
    icon: "FileOutput",
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
];