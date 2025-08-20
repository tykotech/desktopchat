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
import AgentCard from "../AgentCard.tsx";

Deno.test("renders agent details", () => {
  const agent = {
    id: "1",
    name: "Agent One",
    description: "first",
    capabilities: ["search"],
  };
  render(<AgentCard agent={agent} />);
  const name = screen.getByText("Agent One");
  assertEquals(name.textContent, "Agent One");
  const capability = screen.getByText("search");
  assertEquals(capability.textContent, "search");
});
