// src/setupTests.ts
import '@testing-library/jest-dom';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
