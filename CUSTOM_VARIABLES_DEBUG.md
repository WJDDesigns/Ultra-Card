# Custom Variables Debugging Guide

If you're experiencing issues with custom variables (especially global variables not working), follow these steps to debug:

## Quick Debug Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for any errors or debug messages starting with `[UC Variables]`.

### 2. Run Built-in Debug Command
In the browser console, run:
```javascript
window.debugUltraCardCustomVariables()
```

This will output detailed information about:
- Total variable count
- localStorage status
- Raw storage data
- List of all variables with their properties

### 3. Manually Check localStorage
In the browser console, run:
```javascript
localStorage.getItem('ultra-card-custom-variables')
```

This shows the raw JSON data stored for your variables.

### 4. Verify Variable Properties
Check that your global variable has the correct structure:
```javascript
const stored = JSON.parse(localStorage.getItem('ultra-card-custom-variables'));
console.log(stored.map(v => ({ name: v.name, isGlobal: v.isGlobal })));
```

Global variables should have `isGlobal: true`.
Card-specific variables should have `isGlobal: false`.

## Common Issues

### Global Variable Not Showing in List

**Symptom**: You add a global variable but it doesn't appear in the UI.

**Possible Causes**:
1. **localStorage quota exceeded** - Check console for quota errors
2. **Variable name conflict** - A variable with the same name already exists
3. **Invalid variable name** - Name must start with a letter and contain only letters, numbers, and underscores
4. **Browser privacy mode** - Some browsers disable localStorage in private/incognito mode

**Solution**: Check console logs for error messages when adding the variable.

### Global Variable Not Resolving in Templates

**Symptom**: Variable appears in the list but `$variable_name` doesn't work in templates.

**Possible Causes**:
1. **Typo in variable name** - Variable names are case-sensitive
2. **Variable not synced** - Refresh the page or clear browser cache
3. **Template syntax error** - Make sure you're using `$variable_name` not `${variable_name}`

**Solution**: 
```javascript
// Check if variable exists and can be resolved
const service = window.ucCustomVariablesService;
const vars = service.getVariables();
console.log('Global variables:', vars);

// Try to resolve a specific variable
const resolved = service.resolveVariable('your_variable_name', hass);
console.log('Resolved value:', resolved);
```

### Card-Specific vs Global Variables

**Global Variables** (`isGlobal: true`):
- ✅ Stored in localStorage
- ✅ Available across ALL Ultra Cards
- ✅ Synced across browser tabs
- ✅ Survive page refresh
- ❌ Lost if localStorage is cleared

**Card-Specific Variables** (`isGlobal: false`):
- ✅ Stored in card YAML config
- ✅ Only available in that specific card
- ✅ Exported/imported with card config
- ✅ Survive localStorage clears
- ❌ NOT synced across cards

## Debug Logs Added

The latest version includes extensive debug logging. When you add, load, or retrieve variables, you'll see messages like:

```
[UC Variables] Adding variable: { name: 'test', isGlobal: true, ... }
[UC Variables] After push, _variables count: 5
[UC Variables] Loading from storage, raw data length: 523
[UC Variables] Parsed from storage: [...]
[UC Variables] After validation, count: 5
[UC Variables] getVariables called, total _variables: 5
[UC Variables] Variable "test" isGlobal=true, keep=true
```

If you don't see these logs, the variables might not be reaching the service at all.

## Manual Fix

If all else fails, you can manually clear and rebuild your variables:

```javascript
// Clear all variables
localStorage.removeItem('ultra-card-custom-variables');

// Reload the page
location.reload();

// Re-add your variables through the UI
```

## Report a Bug

If you've followed all these steps and global variables still don't work, please report a bug with:
1. Browser and version
2. Home Assistant version
3. Console output from `window.debugUltraCardCustomVariables()`
4. Screenshots of the Custom Variables UI
5. Example variable configuration that's not working
