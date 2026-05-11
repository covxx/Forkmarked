export type Author = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type RecipeSummary = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  createdAt: string;
  authorId: string;
  author: Author;
  _count: {
    likes: number;
    reviews: number;
  };
};

export type RecipeTag = {
  recipeId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    slug: string;
  };
};

export type RecipeDetail = RecipeSummary & {
  ingredients: Ingredient[];
  steps: Step[];
  sourceUrl: string | null;
  isPublic: boolean;
  recipeTags: RecipeTag[];
  _count: {
    likes: number;
    reviews: number;
    comments: number;
  };
};

export type Ingredient = {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
};

export type Step = {
  order: number;
  instruction: string;
  duration?: number;
};

export type UserProfile = {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  email: string;
  clerkId: string;
  _count: {
    recipes: number;
    followers: number;
    following: number;
  };
};

export type CollectionSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _count: {
    entries: number;
  };
};

export type CollectionWithRecipes = CollectionSummary & {
  entries: {
    id: string;
    status: "SAVED" | "COOKING" | "COOKED";
    notes: string | null;
    createdAt: string;
    recipeId: string;
    collectionId: string;
    recipe: RecipeSummary;
  }[];
};

export type Review = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  userId: string;
  recipeId: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  recipeId: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type FollowEntry = {
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: Author & { name: string | null };
  following?: Author & { name: string | null };
};

export type PresignedUpload = {
  presignedUrl: string;
  key: string;
  publicUrl: string;
};
