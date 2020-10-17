import { Transforms, Editor, Range } from "slate";

export const withLinks = editor => {
  console.log("withLinks");
  const { isInline, normalizeNode } = editor;

  editor.isInline = element => {
    return element.type === "link" ? true : isInline(element);
  };

  /*   editor.normalizeNode = entry => {
    const [node, path] = entry
  } */

  return editor;
};

export const isLinkActive = (editor, format) => {
  const [link] = Editor.nodes(editor, { match: n => n.type === "link" });
  return !!link;
};

export const insertLink = (editor, url) => {
  wrapLink(editor, url);
};

export const removeLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === "link" });
};

const wrapLink = (editor, url) => {
  console.log(url);
  if (isLinkActive(editor)) {
    removeLink(editor);
  }
  const { selection } = editor;
  const isExpanded = selection && Range.isExpanded(selection);
  const link = {
    type: "link",
    url,
    children: isExpanded ? [{ text: url }] : [],
  };

  if (isExpanded && !isLinkActive) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    /* Transforms.collapse(editor, { edge: "end" }); */
  }
};
