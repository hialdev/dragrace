"use client";

import dynamic from "next/dynamic";
import { forwardRef, useImperativeHandle, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import with ssr: false is necessary because Quill uses document/window
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-[#b80014] rounded-full animate-spin" />
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "link",
];

export default function RichTextEditor({ value, onChange, placeholder = "Ketik konten di sini...", minHeight = "200px" }: RichTextEditorProps) {
  return (
    <div className="rich-text-editor-container">
      <style dangerouslySetInnerHTML={{__html: `
        .rich-text-editor-container .quill {
          display: flex;
          flex-direction: column;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        .rich-text-editor-container .quill:focus-within {
          border-color: rgba(184, 0, 20, 0.7);
          box-shadow: 0 0 0 1px rgba(184, 0, 20, 0.5);
        }
        .rich-text-editor-container .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(0, 0, 0, 0.2);
          padding: 8px 12px;
        }
        .rich-text-editor-container .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: ${minHeight};
        }
        .rich-text-editor-container .ql-editor {
          color: rgba(255, 255, 255, 0.8);
          min-height: ${minHeight};
          padding: 16px;
        }
        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
        }
        
        /* Toolbar Icons colors */
        .rich-text-editor-container .ql-snow .ql-stroke {
          stroke: rgba(255, 255, 255, 0.6);
        }
        .rich-text-editor-container .ql-snow .ql-fill, 
        .rich-text-editor-container .ql-snow .ql-stroke.ql-fill {
          fill: rgba(255, 255, 255, 0.6);
        }
        .rich-text-editor-container .ql-snow .ql-picker {
          color: rgba(255, 255, 255, 0.6);
        }
        
        /* Active states */
        .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-container .ql-snow .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke {
          stroke: #b80014;
        }
        
        .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item:hover,
        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover,
        .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active {
          color: #b80014;
        }

        .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor-container .ql-snow .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor-container .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #b80014;
        }
      `}} />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
