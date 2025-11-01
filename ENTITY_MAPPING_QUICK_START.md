# Entity Mapping System - Quick Start Guide

## For Users

### How to Use Entity Mapping

#### When Importing a Preset:

1. **Browse Presets**: Go to Layout tab and browse community presets
2. **Add Preset**: Click on any preset to add it to your card
3. **Map Entities** (if dialog appears):
   - Review the detected entities from the preset
   - For each entity, either:
     - Select your equivalent entity from the dropdown
     - Check "Keep Original" if you want to use the preset's entity name
   - Use bulk actions:
     - **Auto-Map Similar**: Automatically maps entities to best matches
     - **Keep All Unmapped**: Keeps original names for all unmapped entities
     - **Clear All**: Resets all mappings
4. **Apply**: Click "Apply Preset" to add the preset with your entities

#### Remapping Entities Later:

1. **Find the Row**: Locate the row containing entities you want to change
2. **Click Remap Icon**: Click the swap icon (↔️) in the row's action toolbar
3. **Map Entities**: Use the same mapping dialog to change entity references
4. **Apply**: Changes are saved automatically

#### Importing Light Module Presets:

1. **Open Light Module**: Edit a light module
2. **Import Section**: Scroll to "Import/Export" section
3. **Paste JSON**: Paste your light preset JSON
4. **Map Entities**: If entities are detected, mapping dialog appears
5. **Apply**: Light presets are added with your entities

## For Developers

### Integration Points

```typescript
// 1. Detect entities in a layout
import { entityDetector } from './services/uc-entity-detector';
const entities = entityDetector.scanLayout(layout);

// 2. Detect entities in a row
const rowEntities = entityDetector.scanRow(row);

// 3. Show mapping dialog
import './components/uc-entity-mapper-dialog';
const dialog = document.createElement('uc-entity-mapper-dialog');
dialog.hass = hass;
dialog.title = 'Map Entities';
document.body.appendChild(dialog);

dialog.show(
  entityReferences,
  (mappings) => {
    // Apply mappings
    const mappedLayout = entityMapper.applyMappingToLayout(layout, mappings);
    // Use mappedLayout
    document.body.removeChild(dialog);
  },
  () => {
    // Cancel
    document.body.removeChild(dialog);
  }
);

// 4. Apply mappings
import { entityMapper } from './services/uc-entity-mapper';
const mappedLayout = entityMapper.applyMappingToLayout(layout, mappings);
const mappedRow = entityMapper.applyMappingToRow(row, mappings);

// 5. Suggest entities (fuzzy matching)
const suggestions = entityMapper.suggestEntities(
  'light.daveslamp',
  Object.keys(hass.states)
);

// 6. Export preset with reversed mappings
import { ucPresetsService } from './services/uc-presets-service';
const exportedPreset = ucPresetsService.exportPreset(preset);
```

### Type Definitions

```typescript
interface EntityReference {
  entityId: string;           // e.g., "light.living_room"
  locations: string[];        // e.g., ["rows[0].columns[0].modules[1].entity"]
  moduleType: string;         // e.g., "icon", "info", "bar"
  context?: string;           // e.g., "Living Room Light"
}

interface EntityMapping {
  original: string;           // Original entity from preset
  mapped: string;             // User's mapped entity
  domain: string;             // Entity domain (light, sensor, etc.)
}

interface PresetDefinition {
  // ... existing fields
  metadata: {
    created: string;
    updated: string;
    downloads?: number;
    rating?: number;
    entityMappings?: EntityMapping[];  // NEW: Stored mappings
  };
}
```

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                           │
│         (Import Preset / Remap Row Entities)            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           Entity Detection Service                       │
│    • Recursively scans layout/row                       │
│    • Finds all entity references                         │
│    • Returns EntityReference[]                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           Entity Mapping Dialog                          │
│    • Shows detected entities                             │
│    • Provides entity pickers                             │
│    • Offers fuzzy match suggestions                      │
│    • Bulk actions (auto-map, keep all, clear)          │
│    • Returns EntityMapping[]                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           Entity Mapper Service                          │
│    • Applies mappings to layout/row                      │
│    • Deep clones and modifies entities                   │
│    • Returns modified configuration                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               Update Configuration                       │
│    • Store mappings in metadata                          │
│    • Update card layout                                  │
│    • Show success message                                │
└─────────────────────────────────────────────────────────┘
```

### Extending for New Module Types

If you add a new module type that uses entities:

1. **Add detection in `uc-entity-detector.ts`**:
```typescript
case 'your_module':
  references.push(...this._scanYourModule(module as YourModule, basePath));
  break;

private _scanYourModule(module: YourModule, basePath: string): EntityReference[] {
  const references: EntityReference[] = [];
  if (module.entity) {
    references.push(
      this._createReference(module.entity, `${basePath}.entity`, 'your_module', module.name)
    );
  }
  return references;
}
```

2. **Add mapping in `uc-entity-mapper.ts`**:
```typescript
case 'your_module':
  return this._mapYourModule(module as YourModule, mappingMap);

private _mapYourModule(module: YourModule, mappingMap: Map<string, string>): YourModule {
  return {
    ...module,
    entity: mappingMap.get(module.entity) || module.entity,
  };
}
```

### Testing

```bash
# Build the project
npm run build

# Check for TypeScript errors
npm run lint

# Test in Home Assistant
# 1. Copy dist/ultra-card.js to your HA custom_components
# 2. Clear browser cache
# 3. Test preset import with entities
# 4. Test row remapping
# 5. Test light module preset import
```

## Troubleshooting

### Dialog doesn't appear
- Check console for errors
- Ensure entities exist in the preset/row
- Verify hass object is available

### Entities not detected
- Check that entity fields follow Ultra Card conventions
- Verify module type is supported
- Check entity detector for your module type

### Mappings not applied
- Verify mappings array is not empty
- Check that entity IDs match exactly
- Ensure mapper handles your module type

### Export doesn't reverse mappings
- Check that metadata.entityMappings exists
- Verify exportPreset() is called
- Ensure entityMapper.reverseMappings() works

## Support

For issues or questions:
1. Check ENTITY_MAPPING_IMPLEMENTATION.md for details
2. Review console logs for errors
3. Test with simple presets first
4. Verify Home Assistant entity IDs are correct

