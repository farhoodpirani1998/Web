/**
 * Public surface of the `achievements` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import
 * `HomeAchievements` only from here — never from `./HomeAchievements`
 * directly.
 */
export { HomeAchievements } from "./HomeAchievements";
