# Animation Accordion Fix Plan

## Problem Description

When selecting "Entity Attribute" as the trigger type in the Animation accordion, both the attribute name dropdown and attribute value field completely fail to appear for users. This prevents users from configuring attribute-based animations.

## Root Cause Analysis

After analyzing the code in `src/editor/global-design-tab.ts`, several potential issues were identified:

1. **Conditional Rendering Logic**:

   - The condition at line 2005 (`this.designProperties.animation_trigger_type === 'attribute'`) that determines whether to show the attribute UI may not be evaluating correctly
   - When this condition fails, the attribute selection UI doesn't render at all

2. **Property Update Mechanism**:

   - When changing the trigger type (lines 1958-1997), the property updates may not be propagating correctly
   - State transitions between different trigger types might be inconsistent

3. **UI Refresh Timing**:

   - The code uses a 50ms timeout for UI refresh, which might not be sufficient for property changes to take effect
   - The component may need more reliable update mechanisms

4. **State Inconsistency**:
   - When switching to attribute mode, the handler resets some values which might affect rendering

## Implementation Plan

### 1. Add Debug Logging

```typescript
// Add before the condition check at line 2005
console.log('Animation trigger type rendering check:', {
  triggerType: this.designProperties.animation_trigger_type,
  isAttribute: this.designProperties.animation_trigger_type === 'attribute',
  entitySelected: !!this.designProperties.animation_entity,
});

// Add in the trigger type change handler at line 1964
console.log(
  'Animation trigger type changing from',
  this.designProperties.animation_trigger_type,
  'to',
  triggerType
);
```

### 2. Improve Conditional Check

The current condition at line 2005:

```typescript
${this.designProperties.animation_trigger_type === 'attribute'
  ? html`...` : html`...`}
```

Should be enhanced to:

```typescript
${(this.designProperties.animation_trigger_type || 'state') === 'attribute'
  ? html`...` : html`...`}
```

This adds a fallback value if the property is undefined.

### 3. Enhance Property Update Logic

The current trigger type change handler needs improvements:

```typescript
@change=${(e: Event) => {
  const triggerType = (e.target as HTMLSelectElement).value as 'state' | 'attribute';

  console.log('Animation trigger type changing to:', triggerType);

  // Create a comprehensive update object with all necessary fields
  const updates: Partial<DesignProperties> = {
    animation_trigger_type: triggerType,
    // Clear values that should be reset when changing modes
    animation_state: '',
  };

  // Handle attribute-specific fields
  if (triggerType === 'attribute') {
    // When switching to attribute mode, ensure attribute field is reset
    updates.animation_attribute = '';
  }

  console.log('Animation trigger type updates:', updates);

  // Batch update all properties at once
  if (this.onUpdate) {
    this.onUpdate(updates);
  } else {
    this.dispatchEvent(
      new CustomEvent('design-changed', {
        detail: updates,
        bubbles: true,
        composed: true,
      })
    );
  }

  // Force multiple UI refreshes with increasing timeouts to ensure rendering
  setTimeout(() => {
    console.log('First UI refresh after trigger type change');
    this.requestUpdate();
  }, 50);

  setTimeout(() => {
    console.log('Second UI refresh after trigger type change');
    this.requestUpdate();
  }, 150);

  setTimeout(() => {
    console.log('Final UI refresh after trigger type change');
    this.requestUpdate();
  }, 300);
}}
```

### 4. Fix UI Refresh Timing

Replace the single 50ms timeout with multiple timeouts at different intervals (as shown above) to ensure the UI updates properly:

```typescript
// Multiple timeouts at different intervals
setTimeout(() => this.requestUpdate(), 50);
setTimeout(() => this.requestUpdate(), 150);
setTimeout(() => this.requestUpdate(), 300);
```

### 5. Add Visual Indicators

Add a visual indicator to show the current trigger type mode:

```typescript
<div class="property-group">
  <label>Animation Trigger Type:</label>
  <select
    id="animation-trigger-type-select"
    .value=${this.designProperties.animation_trigger_type || 'state'}
    @change=${...}
    class="property-select ${this.designProperties.animation_trigger_type === 'attribute' ? 'attribute-mode' : 'state-mode'}"
  >
    <option value="state">Entity State</option>
    <option value="attribute">Entity Attribute</option>
  </select>
  <small class="property-hint trigger-type-indicator">
    ${this.designProperties.animation_trigger_type === 'attribute'
      ? 'Attribute mode: select an attribute and its value to trigger the animation'
      : 'State mode: enter a state value to trigger the animation'}
  </small>
</div>
```

### 6. CSS Styling Improvements

Add these styles to make the attribute UI more visible:

```css
.attribute-mode {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

.trigger-type-indicator {
  font-weight: 500;
  margin-top: 8px;
  padding: 4px 8px;
  background: rgba(var(--rgb-primary-color), 0.1);
  border-radius: 4px;
}

.attribute-value-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  background: rgba(var(--rgb-primary-color), 0.05);
  margin-top: 8px;
}
```

## Implementation Sequence

1. Add debug logging first to verify the current behavior
2. Implement the improved conditional check
3. Enhance the property update logic
4. Fix the UI refresh timing with multiple timeouts
5. Add visual indicators for the current mode
6. Apply the CSS styling improvements

## Testing Plan

After implementation, test the following scenarios:

1. Select an entity, then select "Entity Attribute" as trigger type
   - Verify that both attribute name dropdown and attribute value field appear
2. Switch between "Entity State" and "Entity Attribute" trigger types
   - Confirm the UI updates correctly in both directions
3. Select different attributes from the dropdown

   - Verify that the attribute value options update accordingly

4. Test with different entity types
   - Make sure the attribute selection works with various entity types

## Next Steps

After reviewing this plan, we'll need to switch to Code mode to implement these changes.
