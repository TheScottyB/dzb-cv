import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { List, ListItem } from '../List';
import styles from './List.module.css';

describe('List Component', () => {
  it('renders without errors', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );
    const listElement = screen.getByRole('list');
    expect(listElement).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { List, ListItem } from "../List";

describe("List and ListItem Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders unordered list by default", () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe("UL");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Item 1");
    expect(items[1]).toHaveTextContent("Item 2");
  });

  it('renders ordered list when type is "ordered"', () => {
    render(
      <List type="ordered">
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    );

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("applies marker type correctly", () => {
    const { rerender } = render(
      <List marker="disc">
        <ListItem>Disc marker</ListItem>
      </List>
    );
    expect(screen.getByRole("list").className.length).toBeGreaterThan(0);

    rerender(
      <List marker="circle">
        <ListItem>Circle marker</ListItem>
      </List>
    );
    expect(screen.getByRole("list").className.length).toBeGreaterThan(0);

    rerender(
      <List marker="none">
        <ListItem>No marker</ListItem>
      </List>
    );
    expect(screen.getByRole("list").className.length).toBeGreaterThan(0);
  });

  it("applies spaced property correctly", () => {
    render(
      <List spaced>
        <ListItem>Spaced item</ListItem>
      </List>
    );
    expect(screen.getByRole("list").className.length).toBeGreaterThan(0);
  });

  it("applies horizontal property correctly", () => {
    render(
      <List horizontal>
        <ListItem>Horizontal item 1</ListItem>
        <ListItem>Horizontal item 2</ListItem>
      </List>
    );
    expect(screen.getByRole("list").className.length).toBeGreaterThan(0);
  });

  it("forwards ref correctly for List component", () => {
    const ref = React.createRef<HTMLUListElement>();
    render(
      <List ref={ref}>
        <ListItem>Item</ListItem>
      </List>
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("UL");
  });

  it("forwards ref correctly for ListItem component", () => {
    const ref = React.createRef<HTMLLIElement>();
    render(
      <List>
        <ListItem ref={ref}>Referenced item</ListItem>
      </List>
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("LI");
    expect(ref.current?.textContent).toBe("Referenced item");
  });

  it("applies custom className to List", () => {
    render(
      <List className="custom-list">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole("list")).toHaveClass("custom-list");
  });

  it("applies custom className to ListItem", () => {
    render(
      <List>
        <ListItem className="custom-item">Custom Item</ListItem>
      </List>
    );

    const item = screen.getByText("Custom Item");
    expect(item).toHaveClass("custom-item");
  });

  it("passes additional props to ListItem", () => {
    render(
      <List>
        <ListItem data-testid="custom-item" aria-hidden="true">
          Item with props
        </ListItem>
      </List>
    );

    const item = screen.getByTestId("custom-item");
    expect(item).toHaveAttribute("aria-hidden", "true");
  });

  it("renders nested lists correctly", () => {
    render(
      <List>
        <ListItem>Parent item</ListItem>
        <ListItem>
          Parent with nested list
          <List>
            <ListItem>Nested item 1</ListItem>
            <ListItem>Nested item 2</ListItem>
          </List>
        </ListItem>
      </List>
    );

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);

    expect(screen.getByText("Nested item 1")).toBeInTheDocument();
    expect(screen.getByText("Nested item 2")).toBeInTheDocument();
  });

  it("supports List.Item syntax for nested components", () => {
    render(
      <List data-testid="parent-list">
        <List.Item>Using List.Item syntax</List.Item>
      </List>
    );

    const list = screen.getByTestId("parent-list");
    expect(list).toBeInTheDocument();

    const item = screen.getByText("Using List.Item syntax");
    expect(item).toBeInTheDocument();
    expect(item.tagName).toBe("LI");
  });

  it("has proper accessibility attributes", () => {
    render(
      <List aria-labelledby="list-title" aria-describedby="list-desc">
        <ListItem aria-current="true">Current item</ListItem>
        <ListItem aria-disabled="true">Disabled item</ListItem>
      </List>
    );

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-labelledby", "list-title");
    expect(list).toHaveAttribute("aria-describedby", "list-desc");

    expect(screen.getByText("Current item")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Disabled item")).toHaveAttribute("aria-disabled", "true");
  });
});
