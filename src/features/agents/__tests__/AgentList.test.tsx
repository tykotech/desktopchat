import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { JSDOM } from "npm:jsdom@24.0.0";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
(globalThis as unknown as {
  window: Window;
  document: Document;
  navigator: Navigator;
}).window = dom.window as unknown as Window;
globalThis.document = dom.window.document as Document;
globalThis.navigator = dom.window.navigator as Navigator;

const { render, screen } = await import("npm:@testing-library/react@16.3.0");
import React from "npm:react@18.2.0";
import AgentList from "../AgentList.tsx";

Deno.test("displays message when no agents", () => {
  render(<AgentList agents={[]} />);
  const msg = screen.getByText("No agents available");
  assertEquals(msg.textContent, "No agents available");
});

Deno.test("renders provided agents", () => {
  const agents = [
    { id: "1", name: "Agent One", description: "first", capabilities: [] },
    { id: "2", name: "Agent Two", description: "second", capabilities: [] },
  ];

  render(<AgentList agents={agents} />);
  const agent = screen.getByText("Agent One");
  assertEquals(agent.textContent, "Agent One");
});
