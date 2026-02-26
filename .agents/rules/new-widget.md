# How to Create a New Widget Type

Adding a widget type requires exactly two things:

1. A component file in `src/components/Widget/`
2. A `register()` call in `src/lib/widgetTypes.tsx`

No other files need to be changed.

---

## Step 1 — Create the component

Create `src/components/Widget/FooWidget.tsx`.

The component must accept `WidgetComponentProps<FooData>` as its props:

```tsx
import type { WidgetComponentProps } from "@/lib/widgetRegistry";

interface FooData {
  // all fields your widget needs at runtime
  someField: string;
}

function FooWidget({ id, data }: WidgetComponentProps<FooData>) {
  // `data` is typed as FooData — no casting needed
  // `id` is the widget's unique string ID (e.g. "widget-a1b2c3d4")
  return <div>{data.someField}</div>;
}

export default FooWidget;
```

### If your widget needs to write back to state (e.g. user input)

Update `widgetMetadataAtom` via `useSetAtom`. The Dashboard's metadata-watch effect will debounce-persist the change automatically:

```tsx
import { useSetAtom } from "jotai";
import { widgetMetadataAtom } from "@/atoms";

function FooWidget({ id, data }: WidgetComponentProps<FooData>) {
  const setWidgetMetadata = useSetAtom(widgetMetadataAtom);

  const handleChange = (value: string) => {
    setWidgetMetadata((prev) => ({
      ...prev,
      [id]: { ...prev[id], data: { someField: value } },
    }));
  };

  return <input value={data.someField} onChange={(e) => handleChange(e.target.value)} />;
}
```

Do **not** call `upsertWidgets` directly from the component — Dashboard handles persistence.

---

## Step 2 — Register the type

Add a `register()` call in `src/lib/widgetTypes.tsx`:

```tsx
import FooWidget from "@/components/Widget/FooWidget";

register({
  type: "foo",              // unique string key; stored in the DB `widgets.type` column
  label: "Foo",             // display name shown in the Add Widget picker
  icon: <Foo className="w-5 h-5" />,  // lucide-react icon shown in the picker
  defaultTitle: "Foo",      // title shown in the widget header on creation
  defaultData: {            // data written to DB when the widget is first added
    someField: "",
  },
  parseData: (raw) => {     // deserializes the JSON stored in `widgets.data`
    const r = raw as Record<string, unknown>;
    return {
      someField: typeof r.someField === "string" ? r.someField : "",
    };
  },
  component: FooWidget,
});
```

---

## Data model

### What is persisted

Each widget row in the `widgets` table has:

| Column        | Type    | Description                                   |
|---------------|---------|-----------------------------------------------|
| `id`          | TEXT PK | Unique widget ID (e.g. `"widget-a1b2c3d4"`)   |
| `dashboard_id`| TEXT    | Owning dashboard                              |
| `x`, `y`      | INTEGER | Grid position                                 |
| `w`, `h`      | INTEGER | Grid size                                     |
| `type`        | TEXT    | Registry key (e.g. `"foo"`)                   |
| `title`       | TEXT    | Widget header title (nullable)                |
| `data`        | TEXT    | JSON blob — your widget's data, serialised    |
| `created_at`  | TEXT    | ISO timestamp                                 |

### Data lifecycle

1. **Creation** — `Topbar` calls `getEntry(type)` to get `defaultTitle` and `defaultData`, writes them to `widgetMetadataAtom`, and persists via `upsertWidgets`.
2. **Load** — `Dashboard` calls `getWidgets(dashboardId)`, which calls `parseData` on the stored JSON and populates `widgetMetadataAtom`.
3. **Runtime mutation** — widget writes to `widgetMetadataAtom` via `useSetAtom`. `Dashboard`'s metadata effect debounces (300 ms) and calls `upsertWidgets`.
4. **Layout change** — drag/resize triggers `handleLayoutChange` which also calls the same debounced upsert, passing the latest metadata from the atom.

### `parseData` contract

- Input: the JSON-parsed value of `widgets.data` (may be `{}` or malformed if the row is old)
- Output: a valid `FooData` object — never throw, always return a safe default for missing fields
- Keep it a simple type-narrowing function; no side effects

---

## What NOT to do

- Do **not** edit `src/atoms/index.ts` — `WidgetMetadata.type` is already `string`, no union to extend
- Do **not** edit `src/lib/widgetRegistry.ts` — registry infrastructure, never changes per widget
- Do **not** edit `src/components/Widget/index.tsx` — `renderWidget` uses the registry automatically
- Do **not** edit `src/components/AddWidgetsModal.tsx` — the picker is driven by `getAllEntries()`
- Do **not** add a DB migration — the `type`, `title`, `data` columns already exist
- Do **not** import your widget anywhere except `widgetTypes.tsx` — the side-effect import in `main.tsx` ensures registration runs before first render
