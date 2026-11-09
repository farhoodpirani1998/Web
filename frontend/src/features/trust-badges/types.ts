export interface PublicTrustBadgeMedia {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

export interface PublicTrustBadge {
  id: string;
  name: {
    fa: string;
    en?: string;
  };
  url?: string;
  image: PublicTrustBadgeMedia;
  position: number;
}
