/**
 * Public surface of the `about` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./AboutHero`, `./AboutStats`, etc. files directly.
 */
export { HomeAbout } from "./HomeAbout";
export { AboutHero } from "./AboutHero";
export { AboutStats } from "./AboutStats";
export { AboutStory } from "./AboutStory";
export { AboutValues } from "./AboutValues";
export { AboutTimeline } from "./AboutTimeline";
export { AboutTeam } from "./AboutTeam";
export { AboutFAQ } from "./AboutFAQ";
