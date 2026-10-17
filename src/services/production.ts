// Public connection details. Authorization is enforced by database and Storage RLS.
export const production = {
  url: "https://xtplovndgwimijqjfdmn.supabase.co",
  publishableKey: "sb_publishable_PeZVOxC9nompw9KyJlwpTA_FvLQc3uw",
  siteUrl:
    process.env.EXPO_PUBLIC_SITE_URL ?? "https://eleva-the-club.vercel.app",
};
