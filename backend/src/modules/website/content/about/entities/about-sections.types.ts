import { Translatable } from '../../../core/i18n/locale.enum';

export interface AboutSection<TItem> {
  title?: Translatable<string>;
  description?: Translatable<string>;
  items?: TItem[];
}

export interface AboutStatItem {
  id: string;
  value: string;
  suffix?: string;
  label: Translatable<string>;
}

export interface AboutValueItem {
  id: string;
  title: Translatable<string>;
  description: Translatable<string>;
}

export interface AboutTimelineItem {
  id: string;
  year: string;
  title: Translatable<string>;
  description: Translatable<string>;
}

export interface AboutTeamMember {
  id: string;
  name: Translatable<string>;
  role: Translatable<string>;
  avatarMediaId?: string;
}

export interface AboutSectionMetadata {
  title?: Translatable<string>;
  description?: Translatable<string>;
}

export interface AboutContentSections {
  stats?: AboutSection<AboutStatItem>;
  values?: AboutSection<AboutValueItem>;
  timeline?: AboutSection<AboutTimelineItem>;
  team?: AboutSection<AboutTeamMember>;
  faq?: AboutSectionMetadata;
}
