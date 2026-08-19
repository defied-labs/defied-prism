import type { ParsedStyle } from "../parser/StyleParser";

export interface Compiler {
  compile(style: ParsedStyle): string;
}
