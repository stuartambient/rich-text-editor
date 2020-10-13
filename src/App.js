import React, { useMemo, useState, useCallback } from "react";
import isHotKey from "is-hotkey";
import isUrl from "is-url";
import { createEditor, Range, Editor, Transforms, Node } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import Button from "./Button";
import Icon from "./Icon";
import Toolbar from "./Toolbar";
import { FontBoldIcon } from "@modulz/radix-icons";
import "./styles.css";

const HOTKEYS = {
  "mod+b": "bold",
  "mod-i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+q": "quote",
  "mod+l": "link",
};

const App = () => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  /*   const { isInline } = editor;
  editor.isInline = element => {
    return element.type === "link" ? true : isInline(element);
  }; */
  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Toolbar>
        <MarkButton format="bold" icon="bold" />
        <MarkButton format="italic" icon="italic" />
        <MarkButton format="underline" icon="underline" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="block-quote" icon="quote" />
        <LinkButton format="link" icon="link" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start typing..."
        style={{ padding: "0 .2em 0 .2em" }}
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotKey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : format,
  });
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });
  return !!match;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isRange = editor => {
  const { selection } = editor;
  const selected = selection && Range.edges(selection);
  if (selected) {
    const [range] = Node.fragment(editor, selection);
    const { children } = range;
    return children[0].text;
  }
  return false;
};

const toggleLink = (editor, format) => {
  const { isInline } = editor;
  const selected = isRange(editor);
  const isActive = isLinkActive(editor, format);
  const { anchor, focus } = editor.selection;
  const [{ type }] = Node.fragment(editor, editor.selection);

  const link = {
    type: "link",
    isInline: true,
    url: selected,
    children: [{ text: selected }],
  };

  if (
    editor.selection &&
    Range.isExpanded(editor.selection) &&
    type !== "link"
  ) {
    /* Transforms.splitNodes(editor, { at: end });
    Transforms.splitNodes(editor, { at: start }); */

    Transforms.select(editor, { anchor, focus });

    Transforms.insertNodes(editor, link);
    console.log(editor.isInline("link"));
  } else {
    console.log(editor.isInline("link"));
    /* Transforms.mergeNodes(editor, { at: end });
    Transforms.mergeNodes(editor, { at: start }); */
    Transforms.removeNodes(editor, link);
    Transforms.insertNodes(editor, {
      type: "span",
      children: [{ text: selected }],
    });
  }
};

const isLinkActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });
  console.log("match: ", !!match);
  return !!match;
};

const Element = ({ attributes, children, element }) => {
  /* console.log("attrs: ", attributes, children, element); */
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "link":
      return (
        <a
          {...attributes}
          href={element.url}
          onClick={e => console.log(e.target)}
        >
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <pre {...attributes}>
        <code>{children}</code>
      </pre>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.link) {
    children = <span>{children}</span>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      key={icon}
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      key={icon}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const LinkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      key={icon}
      active={isLinkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleLink(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Say something... " }],
  },
];

export default App;
