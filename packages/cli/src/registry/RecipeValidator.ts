import { flattenRecipe, type Recipe } from "@defied-prism/style-engine";

/**
 * Validates a component's `recipe.json`.
 *
 * Registries serve recipes as data. The CLI never evaluates registry code,
 * so a remote registry cannot run anything on the user's machine.
 */
export class RecipeValidator {
  static parse(content: string, componentName = "unknown"): Recipe {
    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch (err: any) {
      throw new Error(
        `[prism] Failed to parse recipe.json for component "${componentName}": ${err?.message ?? err}`,
      );
    }
    return RecipeValidator.validate(data, componentName);
  }

  static validate(data: unknown, componentName = "unknown"): Recipe {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error(
        `[prism] Component "${componentName}" recipe.json must contain a recipe object.`,
      );
    }
    const recipe = data as Recipe;
    if (typeof recipe.name !== "string") {
      throw new Error(`[prism] Component "${componentName}" recipe.json is missing "name".`);
    }
    if (!recipe.base || typeof recipe.base !== "object" || Array.isArray(recipe.base)) {
      throw new Error(`[prism] Component "${componentName}" recipe.json is missing a "base" object.`);
    }
    // Structural, token and ownership checks
    try {
      flattenRecipe(recipe);
    } catch (err: any) {
      throw new Error(`[prism] Component "${componentName}" has an invalid recipe: ${err?.message ?? err}`);
    }
    return recipe;
  }
}
