"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

function ToolbarButton({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#12212B] text-white"
          : "bg-[#F7FAFB] text-[#12212B] hover:bg-[#EEF3F6]"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  onUploadInlineImage,
}) {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[260px] max-w-none rounded-b-[22px] px-5 py-4 text-[15px] leading-7 text-[#22323D] focus:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "<p></p>", false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  async function handleInlineImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploaded = await onUploadInlineImage(file);
    if (uploaded?.public_url) {
      editor.chain().focus().setImage({
        src: uploaded.public_url,
        alt: file.name,
      }).run();
    }

    event.target.value = "";
  }

  function handleLink() {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      })
      .run();
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#D3DDE5] bg-white">
      <div className="flex flex-wrap gap-2 border-b border-[#E7EEF2] p-3">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>

        <ToolbarButton onClick={handleLink}>
          Link
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet list
        </ToolbarButton>

        <ToolbarButton onClick={() => imageInputRef.current?.click()}>
          Insert image
        </ToolbarButton>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInlineImageChange}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}