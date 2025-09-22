// Update for Ultra Card presets service to use Directories Pro
// Replace the import line in src/services/uc-presets-service.ts

// OLD:
// import { wordpressPresetsAPI, WordPressPreset } from './wordpress-presets-api';

// NEW:
import { directoriesProPresetsAPI, WordPressPreset } from './directories-pro-presets-api';

// Then update the API calls in the _loadWordPressPresets method:

// OLD:
// const response = await wordpressPresetsAPI.fetchPresets({

// NEW:
const response = await directoriesProPresetsAPI.fetchPresets({
  per_page: 50, // Load up to 50 presets initially
  sort: 'popular', // Sort by most popular first
});

// And update the download tracking:

// OLD:
// await wordpressPresetsAPI.trackDownload(wpId);

// NEW:
await directoriesProPresetsAPI.trackDownload(wpId);
