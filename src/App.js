import React, { useMemo, useState, useCallback } from "react";
import isHotKey from "is-hotkey";
import isUrl from "is-url";
import {
  createEditor,
  /* Leaf, */
  Range,
  Editor,
  Transforms,
  /*  Element, */ Node,
} from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import Button from "./Button";
import Icon from "./Icon";
import Toolbar from "./Toolbar";
import "./styles.css";

const HOTKEYS = {
  "mod+b": "bold",
  "mod-i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+q": "quote",
  "mod+l": "link",
};
/* const OTHER_TYPES = ["block-quote"]; */

const App = () => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  /*   const { selection } = editor;
  React.useEffect(() => {
    console.log("selection: ", selection);
  }, [selection]); */

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

const toggleLink = (editor, format) => {
  /* const { selection } = editor;
  const isCollpased = selection && Range.isCollapsed(selection); */
  const isActive = isLinkActive(editor, format);
  console.log("isActive: ", isActive);
  if (isActive) {
    return false;
  } else {
    return true;
  }
  /* if (isActive) return true;
  return false; */
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : format,
  });
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });
  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isLinkActive = (editor, format) => {
  /* console.log("isLinkActive -- ", Editor.nodes, format); */
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });
  return !!match;
};

const insertLink = (editor, url) => {
  console.log("url: ", url);
  /*  if (editor.selection) {
    wrapLink(editor, url);
  } */
};

const Element = ({ attributes, children, element }) => {
  switch (("element type: ", element.type)) {
    case "block-quote":
      Transforms.splitNodes({ always: true });

      return <blockquote {...attributes}>{children}</blockquote>;
    case "link":
      return <a {...attributes}>{children}</a>;
    /* case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>; */
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  /*   if (leaf["block-quote"]) {
    children = <blockquote>{children}</blockquote>;
  } */

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
    type: "div",
    children: [{ text: "Say something... " }],
  },
];

export default App;
