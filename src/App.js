import React, { useEffect, useMemo, useState, useCallback } from "react";
import isHotKey from "is-hotkey";
/* import isUrl from "is-url"; */

import { createEditor, Range, Editor, Transforms, Point, Node } from "slate";
import {
  Slate,
  Editable,
  useEditor,
  useSelected,
  useFocused,
  withReact,
  useSlate,
} from "slate-react";
import { withHistory } from "slate-history";
import Button from "./Button";
/* import Icon from "./Icon"; */
import Toolbar from "./Toolbar";
import {
  withLinks,
  insertLink,
  isLinkActive,
  removeLink,
} from "./helpers/withLinks";
import { withImages, insertImage } from "./helpers/withImages";
import {
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  CodeIcon,
  QuoteIcon,
  Link2Icon,
  ImageIcon,
  SwitchIcon,
} from "@modulz/radix-icons";
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
  const editor = useMemo(
    () => withImages(withLinks(withHistory(withReact(createEditor())))),
    []
  );
  const [toolbar, setToolbar] = useState(false);
  const [messageEntry, setEntry] = useState(false);

  /*   const { isInline } = editor;
  editor.isInline = element => {
    return element.type === "link" ? true : isInline(element);
  }; */
  return (
    <>
      <div className="channel">
        <div className="channel-view">Channel View Area</div>
        {messageEntry ? (
          <div className="entry">This is the entry area</div>
        ) : null}

        <div className="chatbox-form">
          <ToolbarButton
            className="toolbar-switch"
            toolbar={toolbar}
            onMouseDown={() => setToolbar(!toolbar)}
          >
            <SwitchIcon />
          </ToolbarButton>

          <Slate
            editor={editor}
            value={value}
            onChange={value => setValue(value)}
          >
            <div className="scrollable">
              <Editable
                className="editor"
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
            </div>

            {toolbar ? (
              <Toolbar>
                <MarkButton format="bold" icon="bold">
                  <FontBoldIcon />
                </MarkButton>
                <MarkButton format="italic" icon="italic">
                  <FontItalicIcon />
                </MarkButton>
                <MarkButton format="underline" icon="underline">
                  <UnderlineIcon />
                </MarkButton>
                <MarkButton format="code" icon="code">
                  <CodeIcon />
                </MarkButton>
                <BlockButton format="block-quote" icon="quote">
                  <QuoteIcon />
                </BlockButton>
                <LinkButton format="link" icon="link">
                  <Link2Icon />
                </LinkButton>
                <ImageButton format="image">
                  <ImageIcon />
                </ImageButton>
              </Toolbar>
            ) : null}
          </Slate>
        </div>
      </div>
    </>
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
  let selected = isRange(editor);

  /*  const [{ type }] = Node.fragment(editor, editor.selection); */
  const isActive = isLinkActive(editor, format);

  if (!isActive) {
    insertLink(editor, selected);
  } else {
    removeLink(editor);
  }
};

const Element = ({ attributes, children, element }) => {
  const { ...props } = { attributes, children, element };
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
    case "image":
      return <ImageElement {...props} />;
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

const BlockButton = ({ format, icon, children }) => {
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
      {children}
    </Button>
  );
};

const MarkButton = ({ format, icon, children }) => {
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
      {children}
    </Button>
  );
};

const LinkButton = ({ format, icon, children }) => {
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
      {children}
    </Button>
  );
};

const ImageButton = ({ format, children }) => {
  const editor = useEditor();
  return (
    <Button
      key="image"
      /* active={isLinkActive(editor, format)} */
      onMouseDown={event => {
        event.preventDefault();
        const url = prompt("Enter the image URL: ");
        console.log("image url: ", url);
        if (!url) return;

        insertImage(editor, url);
      }}
    >
      {children}
    </Button>
  );
};

const ToolbarButton = ({ className, children, onMouseDown, toolbar }) => {
  return (
    <Button
      className={className}
      key="toolbar-switch"
      onMouseDown={onMouseDown}
      style={{ backgroundColor: toolbar ? "green" : "red" }}
    >
      {children}
    </Button>
  );
};

const ImageElement = ({ attributes, children, element }) => {
  /* const selected = useSelected();
  const focused = useFocused(); */
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt="gee"
          style={{ display: "block", maxWidth: "100%", maxHeight: "10em" }}
        />
      </div>
      {children}
    </div>
  );
};

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Say something... " }],
  },
];

export default App;
