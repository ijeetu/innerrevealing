import React, { useState, useEffect, useCallback } from "react";
import { BiBold, BiItalic, BiUnderline, BiLink, BiImage } from "react-icons/bi";

// --- Lexical Imports ---
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import {
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
  $isLinkNode,
} from "@lexical/link";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  EditorState,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// --- Lexical Theme and Config ---
const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
};

// Catch any errors that occur during Lexical updates.
function onError(error: Error) {
  console.error(error);
}

// Basic Lexical configuration
const initialConfig = {
  namespace: "MyEditor",
  theme,
  onError,
  nodes: [
    HeadingNode,
    QuoteNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    ListItemNode,
    ListNode,
    CodeHighlightNode,
    CodeNode,
    AutoLinkNode,
    LinkNode,
  ],
};

// --- Lexical Toolbar Plugin ---
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update state based on selection format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Check if selection is a link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  // Callback to insert a link
  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt("Enter the URL:");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      // Remove link if already linked
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  // Placeholder for image insertion
  const insertImage = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      // This is where you would dispatch a custom INSERT_IMAGE_COMMAND
      // For now, just log it
      console.log("Image URL entered (logic not implemented):", url);
      alert("Image insertion not fully implemented yet.");
    }
  }, [editor]);

  useEffect(() => {
    // Combine listeners for selection changes and updates
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        () => {
          updateToolbar(); // Update toolbar when format command is dispatched
          return false;
        },
        1 // Low priority
      ),
      editor.registerCommand(
        TOGGLE_LINK_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1 // Low priority
      )
    );
  }, [editor, updateToolbar]);

  return (
    <div className="flex items-center gap-1 border-b border-gray-300 p-2 bg-gray-50 flex-wrap">
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={`p-1 rounded hover:bg-gray-200 ${isBold ? "bg-gray-300" : ""
          }`}
        title="Bold"
        aria-label="Format Bold"
      >
        <BiBold />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={`p-1 rounded hover:bg-gray-200 ${isItalic ? "bg-gray-300" : ""
          }`}
        title="Italic"
        aria-label="Format Italic"
      >
        <BiItalic />
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={`p-1 rounded hover:bg-gray-200 ${isUnderline ? "bg-gray-300" : ""
          }`}
        title="Underline"
        aria-label="Format Underline"
      >
        <BiUnderline />
      </button>
      <button
        onClick={insertLink}
        className={`p-1 rounded hover:bg-gray-200 ${isLink ? "bg-gray-300" : ""
          }`}
        title="Insert Link"
        aria-label="Insert Link"
      >
        <BiLink />
      </button>
      <button
        onClick={insertImage}
        className="p-1 rounded hover:bg-gray-200"
        title="Insert Image (Placeholder)"
        aria-label="Insert Image"
      >
        <BiImage />
      </button>
    </div>
  );
}

// Lexical OnChange Plugin Component to sync state
function OnChangePlugin({
  onChange,
}: {
  onChange: (editorState: EditorState) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);
  return null;
}

interface LexicalEditorProps {
  onChange: (editorState: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

const LexicalEditor: React.FC<LexicalEditorProps> = ({
  onChange,
  placeholder = "Type something...",
  minHeight = "150px",
  className = "",
  label,
  required = false,
}) => {
  // Handle Lexical state changes
  const handleLexicalChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    onChange(editorStateJSON);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarPlugin />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={`w-full p-3 focus:outline-none focus:ring-0 resize-y`}
                  style={{ minHeight }}
                />
              }
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                  {placeholder}
                </div>
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
              // @ts-ignore - Work around type errors with ErrorBoundary
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePlugin onChange={handleLexicalChange} />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditor;
