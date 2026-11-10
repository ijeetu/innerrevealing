import { cn } from "@/lib/utils";
import { getCategoryTree, CategoryTreeItem } from "@/utils/api/user/getCategories";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

// Fetched once and reused across all CategoryNode instances
let treeCache: CategoryTreeItem[] | null = null;
let treeFetchPromise: Promise<CategoryTreeItem[] | null> | null = null;

function getOrFetchTree(): Promise<CategoryTreeItem[] | null> {
  if (treeCache !== null) return Promise.resolve(treeCache);
  if (!treeFetchPromise) {
    treeFetchPromise = getCategoryTree({ per_page: 1000 }).then(result => {
      treeCache = result?.items ?? [];
      treeFetchPromise = null;
      return treeCache;
    });
  }
  return treeFetchPromise;
}

function findSubcategories(tree: CategoryTreeItem[], id: number): CategoryTreeItem[] {
  if (!Array.isArray(tree)) return [];
  for (const node of tree) {
    if (node.id === id) return node.subcategories ?? [];
    if (node.subcategories?.length) {
      const found = findSubcategories(node.subcategories, id);
      if (found.length) return found;
    }
  }
  return [];
}



interface CategoryMinimal {
  id: number;
  slug: string;
  name?: string;
  translated_name?: string;
  all_items_count?: number;
  has_subcategory?: boolean;
  subcategories_count?: number;
}

interface CategoryNodeProps {
  category: CategoryMinimal;
  extraDetails?: Record<string, string | number | undefined>;
  onToggle?: (category: CategoryMinimal, checked: boolean) => void;
  checked?: boolean;
  selectedCategorySlug?: string;
  onAncestorStateChange?: (isAncestor: boolean) => void;
  preloadedSubcategories?: CategoryTreeItem[];
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  extraDetails,
  onToggle,
  checked,
  selectedCategorySlug,
  onAncestorStateChange,
  preloadedSubcategories,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [subcategories, setSubcategories] = useState<CategoryTreeItem[]>(preloadedSubcategories ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAncestorFromChild, setIsAncestorFromChild] = useState(false);

  // If selectedCategorySlug is provided, it serves as the fast decentralized source of truth!
  const urlSelectedSlug = searchParams.get("category") || "";
  const selectedSlug = selectedCategorySlug !== undefined ? selectedCategorySlug : urlSelectedSlug;

  // Apply rule: when no selected slug, nothing is selected
  const actualIsSelected = checked ?? (selectedSlug ? category.slug === selectedSlug : false);

  // Direct parent: a child slug matches the selected slug
  const isParentOfSelected = !actualIsSelected && !!selectedSlug
    && subcategories.some(sub => sub.slug === selectedSlug);

  // Ancestor at any depth: direct parent OR any child subtree reported ancestor
  const isAncestorOfSelected = isParentOfSelected || isAncestorFromChild;

  const [optimisticSelected, setOptimisticSelected] = useState<boolean | null>(null);
  const isSelected = optimisticSelected !== null ? optimisticSelected : actualIsSelected;

  useEffect(() => {
    setOptimisticSelected(null);
  }, [actualIsSelected]);

  // Report ancestor state up to parent node
  useEffect(() => {
    onAncestorStateChange?.(isAncestorOfSelected);
  }, [isAncestorOfSelected, onAncestorStateChange]);

  // When collapsed, children unmount — reset stale ancestor state from child
  useEffect(() => {
    if (!expanded) setIsAncestorFromChild(false);
  }, [expanded]);

  const canExpand = (category.subcategories_count ?? 0) > 0 || category.has_subcategory === true;

  const displayName = category.translated_name || category.name || "";

  const handleFetchChildren = useCallback(async () => {
    if (isLoading || subcategories.length > 0) return;
    setIsLoading(true);
    try {
      const tree = await getOrFetchTree();
      if (tree) {
        setSubcategories(findSubcategories(tree, category.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [category.id, isLoading, subcategories.length]);

  const handleToggleExpand = useCallback(async () => {
    if (!expanded && subcategories.length === 0) {
      await handleFetchChildren();
    }
    setExpanded((prev) => !prev);
  }, [expanded, handleFetchChildren, subcategories.length]);

  // Auto-expand when a child equals the selected slug (after refresh)
  useEffect(() => {
    const maybeExpandForSelected = async () => {
      if (!selectedSlug || !canExpand) return;
      if (expanded && subcategories.length > 0) return; // already shown
      if (subcategories.length === 0) {
        await handleFetchChildren();
      }
      const found = subcategories.some((c) => c.slug === selectedSlug);
      if (found) setExpanded(true);
    };
    // Fire and forget
    void maybeExpandForSelected();
  }, [selectedSlug, canExpand, subcategories, expanded, handleFetchChildren]);

  // Navigate based on checkbox state: set category when checked, remove when unchecked
  const handleNavigate = useCallback((checkedState: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checkedState) {
      // When checking: set the category parameter
      params.set("category", category.slug);
    } else {
      // When unchecking: remove the category parameter
      params.delete("category");
    }
    // Remove extra details if they exist
    if (extraDetails) {
      Object.keys(extraDetails).forEach((key) => params.delete(key));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [category.slug, extraDetails, pathname, router, searchParams]);

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = e.target.checked;
      if (onToggle) {
        onToggle(category, nextChecked);
      } else {
        setOptimisticSelected(nextChecked);
        // Pass the checked state to handleNavigate
        handleNavigate(nextChecked);
      }
    },
    [category, handleNavigate, onToggle]
  );

  const inputId = `cate-${category.id}-${category.slug}`;

  return (
    <li>
      <div className="flex items-center rounded text-sm py-[2px]">
        <div className={cn("flex-1 ltr:text-left rtl:text-right py-1 px-2 rounded-sm flex items-center justify-between gap-2", isAncestorOfSelected ? "bg-primary/10 rounded" : "")}>
          <span className="flex items-center gap-2">
            <input
              id={inputId}
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="form-checkbox h-4 w-4 text-indigo-600 accent-primaryBg"
              aria-label={`Select category ${displayName}`}
            />
            <label htmlFor={inputId} className={cn("break-all cursor-pointer text-md", isAncestorOfSelected ? "primaryColor font-semibold" : "")}>{displayName}</label>
          </span>
          <span className="flex items-center gap-1">
            {typeof category.all_items_count === "number" && (
              <span>({category.all_items_count})</span>
            )}
            {canExpand && (
              <button
                type="button"
                className="text-sm p-1 hover:bg-muted rounded-sm"
                onClick={handleToggleExpand}
                aria-label={expanded ? `Collapse ${displayName}` : `Expand ${displayName}`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {expanded ? <LuMinus size={14} /> : <LuPlus size={14} />}
              </button>
            )}
          </span>
        </div>
      </div>

      {expanded && subcategories.length > 0 && (
        <ul className="list-none ltr:ml-3 rtl:mr-3 ltr:border-l rtl:border-r ltr:pl-2 rtl:pr-2 space-y-1">
          {subcategories.map((sub) => (
            <CategoryNode
              key={sub.id}
              category={sub}
              extraDetails={extraDetails}
              onToggle={onToggle}
              selectedCategorySlug={selectedCategorySlug}
              onAncestorStateChange={setIsAncestorFromChild}
              preloadedSubcategories={sub.subcategories}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryNode;
