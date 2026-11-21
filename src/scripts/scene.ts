/**
 * Day or night for the lighthouse scene.
 *
 * By default it follows the visitor's clock (day 6am to 6pm). The platinum
 * reward is a switch to pick Day or Night for good (or back to Auto); the
 * pick is saved as "sceneChoice" and wiped with the rest of the progress.
 * NightScene's inline script reads the same key before the first paint.
 */
export type Scene = "day" | "night";
export type SceneChoice = "auto" | Scene;

export const SCENE_KEY = "sceneChoice";

export const clockScene = (): Scene => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "day" : "night";
};

export function sceneChoice(): SceneChoice {
  try {
    const v = localStorage.getItem(SCENE_KEY);
    return v === "day" || v === "night" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function setSceneChoice(c: SceneChoice) {
  try {
    if (c === "auto") localStorage.removeItem(SCENE_KEY);
    else localStorage.setItem(SCENE_KEY, c);
  } catch {}
}

/** The scene to show now: the visitor's pick, else the clock. */
export const currentScene = (): Scene => {
  const c = sceneChoice();
  return c === "auto" ? clockScene() : c;
};
